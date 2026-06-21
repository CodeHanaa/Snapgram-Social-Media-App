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
  await appwriteService.account.createEmailPasswordSession(
    user.email,
    user.password
  );
  const account = await appwriteService.account.get();
  localStorage.setItem("isLoggedIn", "true");
  return account;
}

export async function signOutAccount() {
  try {
    await appwriteService.account.deleteSession("current");
  } catch {
    // حتى لو فشل، امسح الـ local state
  } finally {
    localStorage.removeItem("isLoggedIn");
  }
}

export async function getCurrentUser() {
  try {
    if (!localStorage.getItem("isLoggedIn")) return null;

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
    localStorage.removeItem("isLoggedIn");
    return null;
  }
}

/* ================= POSTS ================= */
export async function createPost(post: INewPost) {
  const uploadedFile = await appwriteService.storage.createFile(
    appwriteConfig.storageId,
    ID.unique(),
    post.file[0]
  );

  // ✅ getFileView بدل getFilePreview (Preview محتاج upgrade)
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

    // لو رجع كـ { documents: [...] }
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

    // لو رجع كـ string ID
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
    // ✅ getFileView بدل getFilePreview
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