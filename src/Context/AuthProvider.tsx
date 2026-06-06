import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type IUser } from "@/Types";
import { INITIAL_USER } from "@/Context";
import { getCurrentUser } from "@/lib/Appwrite/Api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthUser = async (): Promise<boolean> => {
    // 1. التحقق من وجود الجلسة محلياً قبل أي شيء
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      setIsLoading(false); // تحديث الحالة هنا مسموح
      navigate("/sign-in");
      return false;
    }

    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        });

        setIsAuthenticated(true);
        return true;
      }

      setIsAuthenticated(false);
      navigate("/sign-in");
      return false;
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
      navigate("/sign-in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  const initAuth = async () => {
    await checkAuthUser();
  };

  initAuth();
}, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}