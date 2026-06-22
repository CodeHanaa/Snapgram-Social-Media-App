import { Link } from "react-router-dom";
import { useState } from "react";
import type { Models } from "appwrite";
import { useUserContext } from "@/Context/useAuthContext";
import { useFollowUser, useUnfollowUser } from "@/lib/react-query/queries";

type UserCardProps = {
  user: Models.Document & {
    name: string;
    username: string;
    imageUrl: string;
    bio?: string;
    followers?: string[];
  };
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: currentUser } = useUserContext();
  const { mutate: follow } = useFollowUser();
  const { mutate: unfollow } = useUnfollowUser();

  const isOwnProfile = currentUser.$id === user.$id;

  const [isFollowing, setIsFollowing] = useState(
    (user.followers as string[] || []).includes(currentUser.$id)
  );

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to profile on button click

    if (isFollowing) {
      setIsFollowing(false);
      unfollow({
        currentUserId: currentUser.$id,
        targetUserId: user.$id,
        currentFollowing: (currentUser.following as string[]) || [],
        targetFollowers: (user.followers as string[]) || [],
      });
    } else {
      setIsFollowing(true);
      follow({
        currentUserId: currentUser.$id,
        targetUserId: user.$id,
        currentFollowing: (currentUser.following as string[]) || [],
        targetFollowers: (user.followers as string[]) || [],
      });
    }
  };

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

      {/* Follow button — hidden on own profile */}
      {!isOwnProfile && (
        <button
          onClick={handleFollow}
          className={`mt-2 px-6 py-1.5 rounded-full text-sm font-medium transition ${
            isFollowing
              ? "bg-dark-4 text-light-2 hover:bg-red-500 hover:text-white"
              : "bg-primary-500 text-white hover:bg-purple-700"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </Link>
  );
};

export default UserCard;