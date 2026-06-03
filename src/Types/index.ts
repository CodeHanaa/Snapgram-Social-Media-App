// ===== NAV =====
export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

// ===== USER (Database Profile) =====
export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio?: string;
};

// ===== NEW USER (DB ONLY - NO PASSWORD) =====
export type INewUser = {
  accountId: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  imageUrl?: string;
};

// ===== AUTH USER (FOR SIGNUP ONLY) =====
export type ISignUpUser = {
  name: string;
  email: string;
  password: string;
  username: string;
};

// ===== UPDATE USER =====
export type IUpdateUser = {
  userId: string;
  name: string;
  bio?: string;
  imageId: string;
  imageUrl: string;
  file: File[];
};

// ===== POST =====
export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];
  location?: string;
  tags?: string;
  username?: string; 
};

// ===== AUTH CONTEXT TYPE =====
export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};