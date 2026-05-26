import { Client, Account, Databases, Storage, Avatars } from 'appwrite';

export class AppwriteConfig {
    public client: Client;
    public account: Account;
    public databases: Databases;
    public storage: Storage;
    public avatars: Avatars;

    constructor() {
        this.client = new Client()
            .setEndpoint(import.meta.env.VITE_APPWRITE_PROJECT_ENDPOINT) 
            // التصحيح: استبدلي {import.meta.env...} بالصيغة الصحيحة بدون أقواس متعرجة
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); 
            
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.avatars = new Avatars(this.client);
    }
}

export const appwriteService = new AppwriteConfig();