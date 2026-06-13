import { useUserContext } from "@/Context/useAuthContext";
import { useSignOutAccount } from "@/lib/react-query/QueriesAndMutation";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const LeftSidebar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  console.log("Current User Data:", user);

  useEffect(() => {
    if (isSuccess) {
      navigate(0);
    }
  }, [isSuccess, navigate]);

  if (!user) {
    return null;
  }

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            className="h-8 md:h-10 w-auto"
          />
        </Link>

        <Link
          to={`/profile/${user.id}`}
          className="flex items-center gap-3"
        >
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="Profile"
            className="h-8 md:h-10 w-auto rounded-full"
          />

          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>

            <p className="small-regular text-light-3">
              @{user.username}
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default LeftSidebar;