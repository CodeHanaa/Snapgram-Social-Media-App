import { Link } from "react-router-dom"; // ملحوظة: تم تعديل المسار هنا لـ react-router-dom لتوحيد المكتبة مع باقي المشروع
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/QueriesAndMutation";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/Context/useAuthContext";

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const handleSignOut = () => {
    signOut();
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(0);
    }
  }, [isSuccess, navigate]);

  return (
    <section className="sticky top-0 z-50 w-full bg-dark-2 border-b border-dark-4 md:hidden">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            className="h-8 md:h-10 w-auto"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={handleSignOut}
          >
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="w-5 h-5"
            />
          </Button>

          <Link to={`/profile/${user.id}`} className="flex-center gap-3 ">
            <img 
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"} 
              alt="profile" 
              className="w-8 h-8 rounded-full" 
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;