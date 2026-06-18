import { ID, Query } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewPost, INewUser, IPost, IUpdatePost } from "@/Types";

import type { Models } from "appwrite";

type CommentType = Models.Document & {
  content: string;

  users?: {
    $id: string;
    name: string;
  };

  posts: string;
};

// ================= SIGN UP =================
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

// ================= CREATE USER =================
export async function createUserAccount(user: INewUser) {
  try {
    const profileImageUrl =
      user.imageUrl && user.imageUrl.startsWith("http")
        ? user.imageUrl
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name
          )}&background=random`;

    const newUser = await saveUserToDatabase({
      accountId: user.accountId,
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

// ================= SAVE USER =================
export async function saveUserToDatabase(user: {
  accountId: string;
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
        accountId: user.accountId,
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

// ================= SIGN IN =================
export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    try {
      await appwriteService.account.deleteSession("current");
    } catch {
      // ignore
    }

    return await appwriteService.account.createEmailPasswordSession(
      user.email,
      user.password
    );
  } catch (error) {
    console.error("SignIn Error:", error);
    throw error;
  }
}

// ================= GET CURRENT USER =================
export async function getCurrentUser() {
  try {
    const currentAccount = await appwriteService.account.get();

    if (!currentAccount) return null;

    const currentUser = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      return null;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return null;
  }
}

// ================= SIGN OUT =================
export async function signOutAccount() {
  try {
    await appwriteService.account.deleteSession("current");
  } catch (error) {
    console.error("SignOut Error:", error);
    throw error;
  }
}

// ================= CREATE POST =================
export async function createPost(post: INewPost): Promise<IPost> {
  const uploadedFile = await appwriteService.storage.createFile(
    appwriteConfig.storageId,
    ID.unique(),
    post.file[0]
  );

  const fileUrl = appwriteService.storage.getFilePreview(
    appwriteConfig.storageId,
    uploadedFile.$id
  );

  const newPost = await appwriteService.databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    ID.unique(),
    {
      creator: post.creatorId,
      caption: post.caption,
      imageUrl: fileUrl,
      imageId: uploadedFile.$id,
      location: post.location,
      tags: post.tags,
    }
  );

  return newPost as unknown as IPost;
}

// ================= RECENT POSTS =================
export async function getRecentPosts() {
  try {
    const posts = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    return posts.documents;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ================= DELETE POST =================
export async function deletePost(postId: string, imageId: string) {
  try {
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
  } catch (error) {
    console.error("Delete Post Error:", error);
    throw error;
  }
}

// ================= GET POST BY ID =================
// ================= GET POST BY ID =================
export async function getPostById(postId: string): Promise<IPost> {
  const post = await appwriteService.databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    postId
  );

  // بدلاً من بناء كائن يدوي، نقوم بإرجاع الـ post كما هو
  // ونتأكد من أنه يطابق النوع IPost باستخدام "as IPost"
  return post as unknown as IPost;
}

// ================= UPDATE POST =================
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
      
      // ✅ الحل هنا
      location: post.location ?? "",
      tags: post.tags ?? [],
    }
  );
}

export async function getCommentsByPost(postId: string): Promise<CommentType[]> {
  try {
    const response = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("posts", postId)]
    );

    return response.documents as unknown as CommentType[];
  } catch (error) {
    console.error(error);
    return [];
  }
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
  try {
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
  } catch (error) {
    console.error("Create comment error:", error);
    throw error;
  }
}

// ================= LIKE POST =================
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await appwriteService.databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    return updatedPost;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}