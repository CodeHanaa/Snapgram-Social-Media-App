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
export async function createPost(post: {
  userId: string; 
  caption: string;
  file: File[];
  location: string;
  tags: string[];
}) {
  try {
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );

    // هذا السطر يعيد نصاً (URL)، فلا تستخدمي .href
    const fileUrl = appwriteService.storage.getFileView(
      appwriteConfig.storageId,
      uploadedFile.$id
    );

    const newPost = await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId, // هذا يجب أن يكون الـ $id للمستخدم في collection users
        caption: post.caption,
        imageUrl: fileUrl.toString(), // تأكدي من تحويله لنص
        imageId: uploadedFile.$id,
        location: post.location,
        tags: post.tags,
      }
    );

    return newPost;
  } catch (error) {
    console.error("Error in createPost API:", error);
    throw error;
  }
}

// 🔍 GET RECENT POSTS
export async function getRecentPosts() {
  try {
    const posts = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.orderDesc("$createdAt"), 
        Query.limit(20)
      ]
    );

    // إذا استمرت المشكلة، هذا يعني أن الـ creator لا يُجلب ككائن
    // يمكنك إضافة هذه الخطوة للتأكد:
    console.log("Posts fetched:", posts.documents);
    
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
  tags: string; // لاحظي هنا أنها تصل String من الـ Form
}) {
  try {
    const updatedPost = await appwriteService.databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: post.imageUrl,
        imageId: post.imageId,
        location: post.location,
        tags: post.tags.replace(/ /g, "").split(","), // نحول الـ String إلى Array هنا
      }
    );

    return updatedPost;
  } catch (error) {
    console.error("Error in updatePost API:", error);
    throw error;
  }
}