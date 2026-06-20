import { ID, Query } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewPost, INewUser, IPost, IUpdatePost } from "@/Types";
import type { Models } from "appwrite";

/* ================= COMMENT TYPE ================= */
type CommentType = Models.Document & {
  content: string;
  users?: {
    $id: string;
    name: string;
  };
  posts: string;
};

/* ================= SIGN UP & USER ================= */
export async function signUpAccount(user: { email: string; password: string; name: string; userName: string; }) {
  return await appwriteService.account.create(ID.unique(), user.email, user.password, user.name);
}

export async function createUserAccount(user: INewUser) {
  const profileImageUrl = user.imageUrl && user.imageUrl.startsWith("http")
      ? user.imageUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  return await saveUserToDatabase({ accountId: user.accountId, name: user.name, email: user.email, username: user.username, bio: user.bio || "", imageUrl: profileImageUrl });
}

export async function saveUserToDatabase(user: { accountId: string; name: string; email: string; username?: string; bio?: string; imageUrl: string; }) {
  return await appwriteService.databases.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), {
    accountId: user.accountId, name: user.name, email: user.email, username: user.username || "", bio: user.bio || "", imageId: "", imageUrl: user.imageUrl,
  });
}

export async function signInAccount(user: { email: string; password: string }) {
  await appwriteService.account.createEmailPasswordSession(
    user.email,
    user.password
  );

  return await appwriteService.account.get(); // مهم
}

export async function getCurrentUser() {
  try {
    // 1. نحاول الحصول على الحساب الحالي
    const currentAccount = await appwriteService.account.get();

    // 2. إذا لم نجد حساباً، نرجع null بهدوء بدون throw Error
    if (!currentAccount) return null;

    // 3. جلب بيانات المستخدم من قاعدة البيانات
    const currentUser = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (currentUser.documents.length === 0) return null;

    return currentUser.documents[0];
  } catch (error) {
    // هنا لا نطبع الخطأ في الـ Console إذا كان خطأ 401 (غير مسجل دخول)
    // حتى لا يظهر كل هذا التنبيه الأحمر المزعج
    console.log("error",error)
    return null;
  }
}

export async function signOutAccount() { return await appwriteService.account.deleteSession("current"); }

/* ================= POSTS ================= */
export async function createPost(post: INewPost) {
  const uploadedFile = await appwriteService.storage.createFile(appwriteConfig.storageId, ID.unique(), post.file[0]);
  const imageUrl = appwriteService.storage.getFilePreview(appwriteConfig.storageId, uploadedFile.$id);
  
  return await appwriteService.databases.createDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, ID.unique(), {
    creator: post.creatorId, // الـ Relationship هنا سيتكفل بالباقي
    caption: post.caption,
    imageUrl,
    imageId: uploadedFile.$id,
    location: post.location || "",
    tags: post.tags || [],
    likes: [],
  });
}

export async function getRecentPosts() {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt")]
  );

  return posts.documents;
}

/* ================= GET POST BY ID ================= */
export async function getPostById(postId: string): Promise<IPost | null> {
  try {
    // 1. جلب البوست (الـ creator سيعود كـ String ID هنا)
    const postDoc = await appwriteService.databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    // 2. التحقق من وجود creator
    const creatorId = postDoc.creator as unknown as string;
    if (!creatorId) return postDoc as unknown as IPost; // أو التعامل مع الحالة الفارغة

    // 3. جلب بيانات المستخدم يدوياً باستخدام ID من الـ post
    const userDoc = await appwriteService.databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      creatorId
    );

    // 4. دمج البيانات لإنشاء كائن IPost كامل
    const fullPost: IPost = {
      ...(postDoc as unknown as Omit<IPost, "creator">),
      creator: userDoc as unknown as IPost["creator"], // تحويل المستخدم لنوع الـ creator المطلوب
    };

    return fullPost;

  } catch (error) {
    console.log("getPostById ERROR:", error);
    return null;
  }
}

// في ملف Api.ts
export async function getSavedPosts(userId: string) {
  const response = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    [Query.equal("user", userId)]
  );
  return response.documents;
}

/* ================= SAVE POST ================= */
export async function savePost(postId: string, userId: string) {
  try {
    return await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}

export async function deletePost(postId: string, imageId: string) {
  await appwriteService.databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, postId);
  if (imageId) await appwriteService.storage.deleteFile(appwriteConfig.storageId, imageId);
}

export async function updatePost(post: IUpdatePost) {
  let { imageId, imageUrl } = post;
  if (post.file.length > 0) {
    const uploadedFile = await appwriteService.storage.createFile(appwriteConfig.storageId, ID.unique(), post.file[0]);
    imageId = uploadedFile.$id;
    imageUrl = appwriteService.storage.getFilePreview(appwriteConfig.storageId, uploadedFile.$id);
    await appwriteService.storage.deleteFile(appwriteConfig.storageId, post.imageId);
  }
  return await appwriteService.databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, post.postId, {
    caption: post.caption, imageUrl, imageId, location: post.location ?? "", tags: post.tags ?? [],
  });
}

/* ================= COMMENTS & LIKES ================= */
export async function getCommentsByPost(postId: string): Promise<CommentType[]> {
  const response = await appwriteService.databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.commentsCollectionId, [Query.equal("posts", postId)]);
  return response.documents as unknown as CommentType[];
}

export async function createComment({ postId, userId, content }: { postId: string; userId: string; content: string; }) {
  return await appwriteService.databases.createDocument(appwriteConfig.databaseId, appwriteConfig.commentsCollectionId, ID.unique(), {
    posts: postId, users: userId, content,
  });
}

export async function likePost(postId: string, likesArray: string[]) {
  return await appwriteService.databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, postId, { likes: likesArray });
}