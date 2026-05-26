import { ID } from "appwrite";
import { appwriteService } from "@/lib/Appwrite/Config"; // استيراد الـ Instance اللي عملناها
import type { INewUser } from "@/Types/index"; // استيراد نوع البيانات الخاص بالمستخدم الجديد

export async function createUserAccount(user: INewUser) {
    try {
        // نستخدم الـ account من داخل الـ appwriteService
        const newAccount = await appwriteService.account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
        
        return newAccount;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

