import { Link, NavLink, useNavigate } from "react-router-dom";
import { sidebarLinks } from "@/constants";
import { useUserContext } from "@/Context/useAuthContext";
import { useSignOutAccount } from "@/lib/react-query/QueriesAndMutation";
import { useEffect } from "react";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) {
      navigate(0);
    }
  }, [isSuccess, navigate]);

  if (!user) return null;

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>

        {/* Profile */}
        <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="Profile"
            className="h-12 w-12 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>

        {/* Links */}
        <ul className="flex flex-col gap-2">
          {sidebarLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.route}
                className={({ isActive }) =>
                  `leftsidebar-link group flex gap-3 items-center px-4 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-light-1 hover:bg-primary-500 hover:text-white"
                  }`
                }
              >
                <img
                  src={link.imgURL}
                  alt={link.label}
                  className="w-5 h-5 transition group-hover:invert"
                />

                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut()}
        className="flex gap-3 items-center px-4 py-2 mt-4 rounded-lg hover:bg-primary-500 transition group"
      >
        <img
          src="/assets/icons/logout.svg"
          alt="logout"
          className="w-5 h-5 transition group-hover:invert"
        />
        <p className="small-medium lg:base-medium">Logout</p>
      </button>
    </nav>
  );
};

export default LeftSidebar;