import { ID } from "appwrite";
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
    // نولد رابط الصورة الافتراضي فوراً إذا كان الرابط فارغاً
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
      imageUrl: profileImageUrl, // إرسال الرابط الصالح دائماً
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