import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserContext } from "@/Context/useAuthContext";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import { getRecentPosts } from "@/lib/Appwrite/Api";
import type { Models } from "appwrite";
import type { IPost } from "@/Types";
import Loader from "@/components/shared/Loader";
import LikedPosts from "@/_root/pages/LikedPosts";
import { useFollowUser, useUnfollowUser } from "@/lib/react-query/queries";

type UserType = Models.Document & {
  name: string;
  username: string;
  imageUrl: string;
  bio?: string;
  email: string;
  followers?: string[];
  following?: string[];
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const { mutate: follow } = useFollowUser();
  const { mutate: unfollow } = useUnfollowUser();

  const isOwnProfile = currentUser.$id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setIsLoading(true);

        const userDoc = await appwriteService.databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          id
        );
        const typedUser = userDoc as unknown as UserType;
        setProfileUser(typedUser);

        // Check if current user is already following this profile
        setIsFollowing(
          (typedUser.followers as string[] || []).includes(currentUser.$id)
        );

        const allPosts = await getRecentPosts();
        const filtered = allPosts.filter((post) => {
          const creator = post.creator as unknown as { $id: string };
          return creator?.$id === id;
        });
        setUserPosts(filtered as unknown as IPost[]);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollow = () => {
    if (!profileUser) return;

    if (isFollowing) {
      setIsFollowing(false);
      setProfileUser((prev) => prev ? {
        ...prev,
        followers: (prev.followers || []).filter((fid) => fid !== currentUser.$id),
      } : prev);
      unfollow({
        currentUserId: currentUser.$id,
        targetUserId: profileUser.$id,
        currentFollowing: (currentUser.following as string[]) || [],
        targetFollowers: (profileUser.followers as string[]) || [],
      });
    } else {
      setIsFollowing(true);
      setProfileUser((prev) => prev ? {
        ...prev,
        followers: [...(prev.followers || []), currentUser.$id],
      } : prev);
      follow({
        currentUserId: currentUser.$id,
        targetUserId: profileUser.$id,
        currentFollowing: (currentUser.following as string[]) || [],
        targetFollowers: (profileUser.followers as string[]) || [],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-light-4">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-8">

        {/* BACK */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-light-2 hover:text-white transition w-fit"
        >
          <img src="/assets/icons/back.svg" alt="back" className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* PROFILE HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-dark-2 rounded-3xl p-8">
          <img
            src={profileUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={profileUser.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-dark-4"
          />

          <div className="flex flex-col gap-4 flex-1 text-center sm:text-left">
            <div>
              <h2 className="text-white text-2xl font-bold">{profileUser.name}</h2>
              <p className="text-light-3">@{profileUser.username}</p>
            </div>

            {profileUser.bio && (
              <p className="text-light-2 text-sm">{profileUser.bio}</p>
            )}

            {/* Stats: posts, followers, following */}
            <div className="flex gap-6 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{userPosts.length}</p>
                <p className="text-light-3 text-sm">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">
                  {profileUser.followers?.length || 0}
                </p>
                <p className="text-light-3 text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">
                  {profileUser.following?.length || 0}
                </p>
                <p className="text-light-3 text-sm">Following</p>
              </div>
            </div>

            {/* Edit profile or Follow button */}
            {isOwnProfile ? (
              <Link
                to={`/update-profile/${id}`}
                className="flex items-center gap-2 bg-dark-3 hover:bg-dark-4 text-white px-5 py-2 rounded-xl text-sm transition w-fit mx-auto sm:mx-0"
              >
                <img src="/assets/icons/edit.svg" alt="edit" className="w-4 h-4" />
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition w-fit mx-auto sm:mx-0 ${
                  isFollowing
                    ? "bg-dark-4 text-light-2 hover:bg-red-500 hover:text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div>
          <div className="flex gap-6 border-b border-dark-4 mb-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 text-sm font-medium transition border-b-2 ${
                activeTab === "posts"
                  ? "border-purple-500 text-white"
                  : "border-transparent text-light-3 hover:text-white"
              }`}
            >
              {isOwnProfile ? "My Posts" : `${profileUser.name}'s Posts`}
            </button>

            {/* Liked Posts tab — only visible on own profile */}
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("liked")}
                className={`pb-3 text-sm font-medium transition border-b-2 ${
                  activeTab === "liked"
                    ? "border-purple-500 text-white"
                    : "border-transparent text-light-3 hover:text-white"
                }`}
              >
                Liked Posts
              </button>
            )}
          </div>

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            userPosts.length === 0 ? (
              <p className="text-light-4 text-center mt-10">No posts yet</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userPosts.map((post) => (
                  <li
                    key={post.$id}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden group"
                  >
                    <Link to={`/posts/${post.$id}`} className="w-full h-full block">
                      <img
                        src={String(post.imageUrl)}
                        alt="post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/icons/profile-placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1 text-white text-sm">
                          <img src="/assets/icons/like.svg" className="w-5 h-5" alt="likes" />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}

          {/* LIKED POSTS TAB */}
          {activeTab === "liked" && <LikedPosts />}
        </div>

      </div>
    </div>
  );
};

export default Profile;