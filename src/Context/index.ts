import { type IContextType,/*type IUser */} from "@/Types";

export const INITIAL_USER = {
  $id: "",
  accountId: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

export const INITIAL_STATE: IContextType = {
    user: INITIAL_USER,
    isAuthenticated: false,
    isLoading: true,

    setUser: () => {},

    setIsAuthenticated: () => {},

    checkAuthUser: async () => false,
};