import { ID, Query } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewPost, INewUser, IPost, IUpdatePost} from "@/Types";
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

/* ================= SIGN UP ================= */
export async function signUpAccount(user: {
  email: string;
  password: string;
  name: string;
  userName: string;
}) {
  return await appwriteService.account.create(
    ID.unique(),
    user.email,
    user.password,
    user.name
  );
}

/* ================= CREATE USER ================= */
export async function createUserAccount(user: INewUser) {
  const profileImageUrl =
    user.imageUrl && user.imageUrl.startsWith("http")
      ? user.imageUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=random`;

  return await saveUserToDatabase({
    accountId: user.accountId,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio || "",
    imageUrl: profileImageUrl,
  });
}

/* ================= SAVE USER ================= */
export async function saveUserToDatabase(user: {
  accountId: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  imageUrl: string;
}) {
  return await appwriteService.databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    {
      accountId: user.accountId,
      name: user.name,
      email: user.email,
      username: user.username || "",
      bio: user.bio || "",
      imageId: "",
      imageUrl: user.imageUrl,
    }
  );
}

/* ================= SIGN IN ================= */
export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    await appwriteService.account.deleteSession("current");
  } catch (error) {
  console.error(error);
}

  return await appwriteService.account.createEmailPasswordSession(
    user.email,
    user.password
  );
}

/* ================= CURRENT USER ================= */
export async function getCurrentUser() {
  try {
    const currentAccount = await appwriteService.account.get();

    const currentUser = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    return currentUser.documents[0] || null;
  } catch {
    return null;
  }
}

/* ================= SIGN OUT ================= */
export async function signOutAccount() {
  return await appwriteService.account.deleteSession("current");
}

/* ================= CREATE POST ================= */
export async function createPost(post: INewPost): Promise<IPost> {
  try {
    // 1. رفع الصورة
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );

    if (!uploadedFile) {
      throw new Error("File upload failed");
    }

    // 2. الحصول على رابط الصورة
    const fileUrl = appwriteService.storage.getFilePreview(
      appwriteConfig.storageId,
      uploadedFile.$id
    );

    // 3. إنشاء البوست في الداتابيز
    // تم تغيير مفتاح "creator" إلى "users" ليتطابق مع الـ Attribute في Appwrite
    const newPost = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        users: post.creatorId, 
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location ?? "",
        tags: post.tags ?? [],
        likes: [],
      }
    );

    return newPost as unknown as IPost;
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    throw error;
  }
}

/* ================= RECENT POSTS ================= */
export async function getRecentPosts() {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(20)]
  );

  return posts.documents;
}

/* ================= SAVE POST ================= */
export async function savePost(postId: string, userId: string) {
  return await appwriteService.databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    ID.unique(),
    {
      user: userId,
      post: postId,
    }
  );
}

// ================= GET SAVED POSTS =================
export async function getSavedPosts(userId: string) {
  const response = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    [Query.equal("user", userId)]
  );

  console.log("RAW SAVES:", response.documents);

  return response.documents;
}

// ================= DELETE SAVED POST =================
export async function deleteSavedPost(savedId: string) {
  try {
    await appwriteService.databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedId
    );

    return { status: "ok" };
  } catch (error) {
    console.error("Delete Saved Error:", error);
    throw error;
  }
}

/* ================= DELETE POST ================= */
export async function deletePost(postId: string, imageId: string) {
  await appwriteService.databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    postId
  );

  if (imageId) {
    await appwriteService.storage.deleteFile(
      appwriteConfig.storageId,
      imageId
    );
  }

  return { status: "ok" };
}

/* ================= GET POST BY ID ================= */
// في ملف Api.ts
// في ملف Api.ts
export async function getPostById(postId: string) {
  try {
    const post = await appwriteService.databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    // نقوم بالتحويل هنا مرة واحدة
    return post as unknown as IPost; 
  } catch (error) {
    console.log(error);
  }
}

/* ================= UPDATE POST ================= */
export async function updatePost(post: IUpdatePost) {
  let imageId = post.imageId;
  let imageUrl = post.imageUrl;

  if (post.file.length > 0) {
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );

    imageId = uploadedFile.$id;

    imageUrl = appwriteService.storage.getFilePreview(
      appwriteConfig.storageId,
      uploadedFile.$id
    );

    await appwriteService.storage.deleteFile(
      appwriteConfig.storageId,
      post.imageId
    );
  }

  return await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    post.postId,
    {
      caption: post.caption,
      imageUrl,
      imageId,
      location: post.location ?? "",
      tags: post.tags ?? [],
    }
  );
}

/* ================= COMMENTS ================= */
export async function getCommentsByPost(postId: string): Promise<CommentType[]> {
  const response = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    [Query.equal("posts", postId)]
  );

  return response.documents as unknown as CommentType[];
}

export async function createComment({
  postId,
  userId,
  content,
}: {
  postId: string;
  userId: string;
  content: string;
}) {
  return await appwriteService.databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    ID.unique(),
    {
      posts: postId,
      users: userId,
      content,
    }
  );
}

/* ================= LIKE POST ================= */
export async function likePost(postId: string, likesArray: string[]) {
  return await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    postId,
    {
      likes: likesArray,
    }
  );
}