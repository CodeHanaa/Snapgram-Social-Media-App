import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserContext } from "@/Context/useAuthContext";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import { getRecentPosts } from "@/lib/Appwrite/Api";
import type { Models } from "appwrite";
import type { IPost } from "@/Types";

type UserType = Models.Document & {
  name: string;
  username: string;
  imageUrl: string;
  bio?: string;
  email: string;
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setProfileUser(userDoc as unknown as UserType);

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-light-4">Loading...</p>
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

        {/* ✅ BACK */}
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

            <div className="flex gap-6 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{userPosts.length}</p>
                <p className="text-light-3 text-sm">Posts</p>
              </div>
            </div>

            {isOwnProfile && (
              <Link
                to={`/update-profile/${id}`}
                className="flex items-center gap-2 bg-dark-3 hover:bg-dark-4 text-white px-5 py-2 rounded-xl text-sm transition w-fit mx-auto sm:mx-0"
              >
                <img src="/assets/icons/edit.svg" alt="edit" className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* POSTS GRID */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">
            {isOwnProfile ? "My Posts" : `${profileUser.name}'s Posts`}
          </h3>

          {userPosts.length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;