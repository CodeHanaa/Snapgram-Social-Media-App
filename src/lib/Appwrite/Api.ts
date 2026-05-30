import { ID } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import type { INewUser } from "@/Types";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await appwriteService.account.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });

    if (!newAccount) {
      throw new Error("Failed to create user account");
    }

    const imageUrl = appwriteService.avatars
      .getInitials(user.name)
      .toString();

    const newUser = await saveUserToDatabase({
      userId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      bio: user.bio,
      imageUrl,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user account:", error);
    throw error;
  }
}

async function saveUserToDatabase(user: {
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
    console.error("Error saving user to database:", error);
    throw error;
  }
}