import { Client, Account, Databases, Storage, Avatars } from 'appwrite';

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url: import.meta.env.VITE_APPWRITE_PROJECT_ENDPOINT,
    databaseId: import.meta.env.VITE_APPWRITE_PROJECT_DATABASE_ID,
    storageId: import.meta.env.VITE_APPWRITE_PROJECT_STORAGE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    postCollectionId: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
    savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
};

export class AppwriteConfig {
    public client: Client;
    public account: Account;
    public databases: Databases;
    public storage: Storage;
    public avatars: Avatars;

    constructor() {
        this.client = new Client()
            .setEndpoint(appwriteConfig.url)
            .setProject(appwriteConfig.projectId);
            
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.avatars = new Avatars(this.client);
    }
}

export const appwriteService = new AppwriteConfig();