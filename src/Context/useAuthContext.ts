import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContext"; // استيراد الـ Context من الملف الأساسي

export const useUserContext = () => useContext(AuthContext);