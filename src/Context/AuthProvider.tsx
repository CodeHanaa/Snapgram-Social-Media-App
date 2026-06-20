import { useEffect, useState } from "react";
import { type IUser } from "@/Types";
import { INITIAL_USER } from "@/Context";
import { getCurrentUser } from "@/lib/Appwrite/Api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<IUser>(INITIAL_USER);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  // ✅ CHECK AUTH USER
  // ✅ CHECK AUTH USER (النسخة المعدلة والهادئة)
  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        setUser({
          $id: currentAccount.$id,
          accountId: currentAccount.accountId,
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
      return false;
    } catch (error) {
      console.log(error)
      // تم إزالة console.error هنا لأننا لا نريد طباعة خطأ الـ 401 
      // الذي يحدث طبيعياً عندما لا يكون المستخدم مسجلاً

      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ INIT AUTH
  useEffect(() => {
    const init = async () => {
      await checkAuthUser();
    };

    init();
  }, []);

  const value = {
    user,
    setUser,

    isAuthenticated,
    setIsAuthenticated,

    isLoading,

    checkAuthUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}