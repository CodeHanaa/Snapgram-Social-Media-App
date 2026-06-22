import { ID, Query } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewPost, INewUser, IPost, IUpdatePost } from "@/Types";
import type { Models } from "appwrite";

/* ================= COMMENT TYPE ================= */
type CommentType = Models.Document & {
  content: string;
  users?: { $id: string; name: string };
  posts: string;
};

/* ================= SIGN UP & USER ================= */
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

export async function createUserAccount(user: INewUser) {
  const profileImageUrl =
    user.imageUrl && user.imageUrl.startsWith("http")
      ? user.imageUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

  return await saveUserToDatabase({
    accountId: user.accountId,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio || "",
    imageUrl: profileImageUrl,
  });
}

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

export async function signInAccount(user: { email: string; password: string }) {
  try {
    await appwriteService.account.deleteSession("current");
  } catch {
    // no active session
  }

  await appwriteService.account.createEmailPasswordSession(
    user.email,
    user.password
  );
  return await appwriteService.account.get();
}

// ✅ موجودة دلوقتي
export async function signOutAccount() {
  try {
    await appwriteService.account.deleteSession("current");
  } catch {
    // ignore
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await appwriteService.account.get();
    if (!currentAccount) return null;

    const currentUser = await appwriteService.databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (currentUser.documents.length === 0) return null;
    return currentUser.documents[0];
  } catch {
    return null;
  }
}

/* ================= POSTS ================= */
export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );

    const imageUrl = appwriteService.storage
      .getFileView(appwriteConfig.storageId, uploadedFile.$id)
      .toString();

    return await appwriteService.databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.creatorId,
        caption: post.caption,
        imageUrl,
        imageId: uploadedFile.$id,
        location: post.location || "",
        tags: post.tags || [],
        likes: [],
      }
    );
  } catch (error) {
    console.error("createPost error:", error);
    throw error;
  }
}

export async function getRecentPosts() {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt")]
  );

  const postsWithCreator = await Promise.all(
    posts.documents.map(async (post) => {
      try {
        const creatorRaw = post.creator as unknown;

        if (
          creatorRaw &&
          typeof creatorRaw === "object" &&
          "documents" in (creatorRaw as object)
        ) {
          const creatorList = (creatorRaw as { documents: unknown[] }).documents;
          const creator = creatorList[0];
          return { ...post, creator };
        }

        if (typeof creatorRaw === "string") {
          const creator = await appwriteService.databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            creatorRaw
          );
          return { ...post, creator };
        }

        return post;
      } catch {
        return post;
      }
    })
  );

  return postsWithCreator;
}

/* ================= GET POST BY ID ================= */
export async function getPostById(postId: string): Promise<IPost | null> {
  try {
    const postDoc = await appwriteService.databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    const creatorRaw = postDoc.creator as unknown;

    if (
      creatorRaw &&
      typeof creatorRaw === "object" &&
      "documents" in (creatorRaw as object)
    ) {
      const creatorList = (creatorRaw as { documents: unknown[] }).documents;
      const creator = creatorList[0];
      return {
        ...(postDoc as unknown as Omit<IPost, "creator">),
        creator: creator as IPost["creator"],
      };
    }

    if (typeof creatorRaw === "string") {
      const userDoc = await appwriteService.databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        creatorRaw
      );
      return {
        ...(postDoc as unknown as Omit<IPost, "creator">),
        creator: userDoc as unknown as IPost["creator"],
      };
    }

    return postDoc as unknown as IPost;
  } catch (error) {
    console.error("getPostById ERROR:", error);
    return null;
  }
}

/* ================= SAVE / UNSAVE POST ================= */
export async function getSavedPosts(userId: string) {
  const response = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    [Query.equal("user", userId)]
  );
  return response.documents;
}

export async function savePost(postId: string, userId: string) {
  return await appwriteService.databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    ID.unique(),
    { user: userId, post: postId }
  );
}

export async function deleteSavePost(savedRecordId: string) {
  return await appwriteService.databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    savedRecordId
  );
}

/* ================= UPDATE / DELETE POST ================= */
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
}

export async function updatePost(post: IUpdatePost) {
  let { imageId, imageUrl } = post;

  if (post.file.length > 0) {
    const uploadedFile = await appwriteService.storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      post.file[0]
    );
    imageId = uploadedFile.$id;
    imageUrl = appwriteService.storage
      .getFileView(appwriteConfig.storageId, uploadedFile.$id)
      .toString();
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

/* ================= COMMENTS & LIKES ================= */
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
    { posts: postId, users: userId, content }
  );
}

export async function likePost(postId: string, likesArray: string[]) {
  return await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    postId,
    { likes: likesArray }
  );
}

/* ================= SEARCH POSTS ================= */
export async function searchPosts(searchTerm: string) {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.search("caption", searchTerm)]
  );

  const postsWithCreator = await Promise.all(
    posts.documents.map(async (post) => {
      try {
        const creatorRaw = post.creator as unknown;
        if (
          creatorRaw &&
          typeof creatorRaw === "object" &&
          "documents" in (creatorRaw as object)
        ) {
          const creatorList = (creatorRaw as { documents: unknown[] }).documents;
          return { ...post, creator: creatorList[0] };
        }
        if (typeof creatorRaw === "string") {
          const creator = await appwriteService.databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            creatorRaw
          );
          return { ...post, creator };
        }
        return post;
      } catch {
        return post;
      }
    })
  );

  return postsWithCreator;
}

/* ================= GET ALL USERS ================= */
export async function getAllUsers() {
  const users = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.orderDesc("$createdAt")]
  );
  return users.documents;
}

/* ================= LIKED POSTS ================= */
export async function getLikedPosts(userId: string) {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt")]
  );

  const likedPosts = posts.documents.filter((post) => {
    const likes = post.likes;
    if (!Array.isArray(likes) || likes.length === 0) return false;
    if (typeof likes[0] === "string") return (likes as string[]).includes(userId);
    if (typeof likes[0] === "object")
      return (likes as { $id: string }[]).some((u) => u.$id === userId);
    return false;
  });

  return likedPosts;
}

/* ================= SEARCH BY TAG ================= */
export async function getPostsByTag(tag: string) {
  const posts = await appwriteService.databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.search("tags", tag), Query.orderDesc("$createdAt")]
  );
  return posts.documents;
}

/* ================= FOLLOW / UNFOLLOW ================= */
export async function followUser(
  currentUserId: string,
  targetUserId: string,
  currentFollowing: string[],
  targetFollowers: string[]
) {
  await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    currentUserId,
    { following: [...currentFollowing, targetUserId] }
  );

  await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    targetUserId,
    { followers: [...targetFollowers, currentUserId] }
  );
}

export async function unfollowUser(
  currentUserId: string,
  targetUserId: string,
  currentFollowing: string[],
  targetFollowers: string[]
) {
  await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    currentUserId,
    { following: currentFollowing.filter((id) => id !== targetUserId) }
  );

  await appwriteService.databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    targetUserId,
    { followers: targetFollowers.filter((id) => id !== currentUserId) }
  );
}