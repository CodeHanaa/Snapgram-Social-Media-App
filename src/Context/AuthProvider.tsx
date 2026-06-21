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
      // ... (تحديث الحالة كما هو)
      setIsAuthenticated(true);
      return true;
    }
    // إذا لم يوجد حساب، يجب إجبار الحالة على "عدم التوثيق"
    setIsAuthenticated(false);
    setUser(INITIAL_USER); 
    return false;
  } catch (error) {
    console.log(error)
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
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