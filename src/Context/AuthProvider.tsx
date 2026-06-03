import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. إضافة الاستيراد
import { type IUser } from "@/Types";
import { INITIAL_USER } from "@/Context";
import { getCurrentUser } from "@/lib/Appwrite/Api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate(); // 2. تعريف الـ hook
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthUser = async (): Promise<boolean> => {
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
            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const cookieFallback = localStorage.getItem("cookieFallback");
            
            if (cookieFallback === "[]" || cookieFallback === null || cookieFallback === undefined) {
                navigate("/sign-in");
                setIsLoading(false); // مهم جداً: إيقاف الـ loading إذا تم التحويل
            } else {
                const isAuth = await checkAuthUser();
                if (!isAuth) navigate("/sign-in");
            }
        };

        initializeAuth();
    }, [navigate]); 
    
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