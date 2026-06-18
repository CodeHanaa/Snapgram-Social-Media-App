import type { Models } from "appwrite";
import type { IPost } from "@/Types";

import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queries";

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  // ✅ دلوقتي posts = array مباشرة
  const postList = posts ?? [];

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Home Feed
          </h2>

          {isPostLoading ? (
            <p className="text-light-2">Loading posts...</p>
          ) : postList.length === 0 ? (
            <p className="text-light-2">No posts found</p>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {postList.map((post: Models.Document) => (
                <li
                  key={post.$id}
                  className="flex justify-center w-full"
                >
                  <PostCard post={post as unknown as IPost} />
                </li>
              ))}
            </ul>
          )}

          {isErrorPosts && (
            <p className="text-red-500">
              Failed to load posts
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;