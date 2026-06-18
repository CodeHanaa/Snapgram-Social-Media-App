import type { Models } from "appwrite";
import type React from "react";

// ===== USER =====
export interface IUser {
  $id: string;
  accountId: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
}

export type INewUser = {
  accountId: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  imageUrl?: string;
};

// ===== POST =====
export interface IPost extends Models.Document {
  creator: {
    $id: string;
    name: string;
    imageUrl: string;
    email: string;
    username: string;
    bio: string;
  };
  caption: string;
  imageUrl: string;
  imageId: string;
  location: string;
  tags: string[];
  likes: string[];
}

// ===== CREATE POST =====
export type INewPost = {
  caption: string;
  file: File[];
  location?: string;
  tags: string[];
  
  creatorId: string; // DB relationship ID
};

// ===== UPDATE POST =====
export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];

  location?: string;
  tags?: string[];
};

// ===== CONTEXT =====
export type IContextType = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;

  checkAuthUser: () => Promise<boolean>;
};