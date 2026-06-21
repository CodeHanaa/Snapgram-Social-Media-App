import { useEffect, useState, useCallback } from "react";
import { type IUser } from "@/Types";
import { INITIAL_USER } from "@/Context";
import { getCurrentUser } from "@/lib/Appwrite/Api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthUser = useCallback(async (): Promise<boolean> => {
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

      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      return false;
    } catch {
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ الحل: نعمل async function منفصلة جوا الـ effect
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (isMounted) {
        await checkAuthUser();
      }
    };

    initAuth();

    // cleanup لو الكومبوننت اتفك قبل ما الـ async تخلص
    return () => {
      isMounted = false;
    };
  }, [checkAuthUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        checkAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}