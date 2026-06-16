import { ID, Query } from "appwrite"; 
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewUser } from "@/Types";

// 🔵 SIGN UP (AUTH ONLY)
export async function signUpAccount(user: {
  email: string;
  password: string;
  name: string;
  userName: string;
}) {
  try {
    const newAccount = await appwriteService.account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    return newAccount;
  } catch (error) {
    console.error("SignUp Error:", error);
    throw error;
  }
}

// 🟢 CREATE USER (DATABASE PROFILE ONLY)
export async function createUserAccount(user: INewUser) {
  try {
    const profileImageUrl = 
      user.imageUrl && user.imageUrl.startsWith('http') 
        ? user.imageUrl 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

    const newUser = await saveUserToDatabase({
      userId: user.accountId,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio || "",
      imageUrl: profileImageUrl,
    });

    return newUser;
  } catch (error) {
    console.error("CreateUser Error:", error);
    throw error;
  }
}

// 💾 SAVE USER TO DATABASE
export async function saveUserToDatabase(user: {
  userId: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  imageUrl: string;
}) {
  try {
    const newUser = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.userId,
        name: user.name,
        email: user.email,
        username: user.username || "",
        bio: user.bio || "",
        imageId: "",
        imageUrl: user.imageUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error("SaveUser Error:", error);
    throw error;
  }
}

// 🔵 SIGN IN
export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    const session = await appwriteService.account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error) {
    console.error("SignIn Error:", error);
    throw error;
  }
}

// 🔍 GET CURRENT USER
export async function getCurrentUser() {
  try {
    const currentAccount = await appwriteService.account.get();

    if (!currentAccount) throw Error;

    const currentUser = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return null;
  }
}

// 🔵 SIGN OUT
export async function signOutAccount() {
  try {
    await appwriteService.account.deleteSession("current");
  } catch (error) {
    console.error("SignOut Error:", error);
    throw error;
  }
}

// 🔵 CREATE POST (تم تعديلها لضمان توافق الـ Relationship)
// هذا هو الشكل الذي تستقبل فيه الدالة البيانات
export async function createPost(post: {
  userId: string;
  caption: string;
  file: File[];
  location: string;
  tags: string[];
}) {
  try {
    // 1. رفع الصورة إلى Storage
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );

    // 2. الحصول على رابط الصورة
    const fileUrl = appwriteService.storage.getFileView(
      appwriteConfig.storageId,
      uploadedFile.$id
    );

    // 3. إنشاء البوست في Database وربط المستخدم بالـ creator
    const newPost = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,      // هنا الربط الأساسي (الـ ID بتاعك بيروح للـ Column اللي اسمه creator)
        caption: post.caption,
        imageUrl: fileUrl.toString(),
        imageId: uploadedFile.$id,
        location: post.location,
        tags: post.tags,
      }
    );

    return newPost;
  } catch (error) {
    console.error("خطأ أثناء إنشاء البوست:", error);
    throw error;
  }
}

// 🔍 GET RECENT POSTS
export async function getRecentPosts() {
  try {
    const posts = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw error;
  }
}


// 🗑️ DELETE POST
export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw Error;

  try {
    await appwriteService.storage.deleteFile(appwriteConfig.storageId, imageId);
    await appwriteService.databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return { status: "ok" };
  } catch (error) {
    console.error("DeletePost Error:", error);
    throw error;
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await appwriteService.databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw new Error("Post not found");

    return post;
  } catch (error) {
    console.error("Error in getPostById:", error);
    throw error;
  }
}

export async function updatePost(post: {
  postId: string;
  imageId: string;
  imageUrl: string;
  caption: string;
  location: string;
  tags: string[];
  file: File[];
}) {
  try {
    let newImageUrl = post.imageUrl;
    let newImageId = post.imageId;

    if (post.file.length > 0) {
      const uploadedFile = await appwriteService.storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        post.file[0]
      );
      newImageUrl = appwriteService.storage.getFileView(
        appwriteConfig.storageId,
        uploadedFile.$id
      ).toString();
      newImageId = uploadedFile.$id;
      
      await appwriteService.storage.deleteFile(appwriteConfig.storageId, post.imageId);
    }

    const updatedPost = await appwriteService.databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: newImageUrl,
        imageId: newImageId,
        location: post.location,
        tags: post.tags,
      }
    );
    return updatedPost;
  } catch (error) {
    console.error("Error in updatePost API:", error);
    throw error;
  }
}

export async function getCommentsByPost(postId: string) {
  const response = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    [Query.equal("posts", postId)]
  );
  return response.documents;
}

export async function createComment({ postId, userId, content }: { postId: string, userId: string, content: string }) {
  try {
    const newComment = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        content: content,
        users: userId, // يجب أن يتطابق الاسم مع اسم العمود في Appwrite (users)
        posts: postId  // يجب أن يتطابق الاسم مع اسم العمود في Appwrite (posts)
      }
    );
    return newComment;
  } catch (error) {
    console.error("Error creating comment:", error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await appwriteService.databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray }
    );
    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

// 1. دالة حفظ البوست
export async function savePost(postId: string, userId: string) {
  try {
    const newSavedPost = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId, // تأكدي أن هذا هو الـ ID الصحيح للمستخدم
        post: postId,
      }
    );
    return newSavedPost;
  } catch (error) {
    console.error("Error in savePost:", error);
  }
}

// 2. دالة إلغاء الحفظ
export async function deleteSavedPost(savedRecordId: string) {
  try {
    await appwriteService.databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );
    return { status: "ok" };
  } catch (error) {
    console.error("Error in deleteSavedPost:", error);
  }
}

export async function getSavedPosts(userId: string) {
  // إذا لم يكن هناك userId، لا تنفذي الاستعلام
  if (!userId) {
    console.warn("getSavedPosts called without a valid userId");
    return [];
  }
  
  try {
    const savedPosts = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId)]
    );
    return savedPosts.documents;
  } catch (error) {
    console.error("Error in getSavedPosts:", error);
  }
}