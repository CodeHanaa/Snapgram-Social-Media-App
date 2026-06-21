import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Models } from "appwrite";
import type { IPost } from "@/Types";

import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { getAllUsers } from "@/lib/Appwrite/Api";
import { useUserContext } from "@/Context/useAuthContext";

type UserType = Models.Document & {
  name: string;
  username: string;
  imageUrl: string;
};

const Home = () => {
  const { user: currentUser } = useUserContext();
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const filtered = (data as unknown as UserType[])
          .filter((u) => u.$id !== currentUser.$id)
          .slice(0, 5); // ✅ أول 5 بس
        setUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [currentUser.$id]);

  const postList = posts ?? [];

  return (
    <div className="flex flex-1 gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">

      {/* ===== POSTS ===== */}
      <div className="flex flex-col flex-1 max-w-screen-sm mx-auto gap-9 w-full">
        <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>

        {isPostLoading ? (
          <p className="text-light-2">Loading posts...</p>
        ) : postList.length === 0 ? (
          <p className="text-light-2">No posts found</p>
        ) : (
          <ul className="flex flex-col flex-1 gap-9 w-full">
            {postList.map((post: Models.Document) => (
              <li key={post.$id} className="flex justify-center w-full">
                <PostCard post={post as unknown as IPost} />
              </li>
            ))}
          </ul>
        )}

        {isErrorPosts && (
          <p className="text-red-500">Failed to load posts</p>
        )}
      </div>

      {/* ===== PEOPLE SIDEBAR (مخفي على موبايل) ===== */}
      <div className="hidden xl:flex flex-col gap-6 w-72 shrink-0">
        <div className="bg-dark-2 rounded-3xl p-6 flex flex-col gap-5 sticky top-0">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold text-base">
              People you may know
            </h3>
            <Link
              to="/all-users"
              className="text-purple-400 text-sm hover:text-purple-300 transition"
            >
              See all
            </Link>
          </div>

          {/* USERS LIST */}
          {users.length === 0 ? (
            <p className="text-light-4 text-sm text-center">No users found</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {users.map((user) => (
                <li key={user.$id}>
                  <Link
                    to={`/profile/${user.$id}`}
                    className="flex items-center gap-3 hover:bg-dark-3 rounded-xl p-2 transition"
                  >
                    <img
                      src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-light-3 text-xs truncate">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* MORE BUTTON */}
          <Link
            to="/all-users"
            className="w-full py-2 rounded-xl border border-dark-4 text-light-2 hover:bg-dark-3 transition text-sm text-center"
          >
            View all people →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;