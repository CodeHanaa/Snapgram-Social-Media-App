import { Link } from "react-router-dom";
import type { Models } from "appwrite";

type UserCardProps = {
  user: Models.Document & {
    name: string;
    username: string;
    imageUrl: string;
    bio?: string;
  };
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link
      to={`/profile/${user.$id}`}
      className="flex flex-col items-center gap-3 bg-dark-2 rounded-2xl p-6 hover:bg-dark-3 transition text-center"
    >
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={user.name}
        className="w-20 h-20 rounded-full object-cover border-2 border-dark-4"
      />
      <div className="flex flex-col items-center gap-1">
        <p className="text-white font-semibold text-base">{user.name}</p>
        <p className="text-light-3 text-sm">@{user.username}</p>
        {user.bio && (
          <p className="text-light-4 text-xs mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
      <span className="mt-2 px-6 py-1.5 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-purple-700 transition">
        View Profile
      </span>
    </Link>
  );
};

export default UserCard;