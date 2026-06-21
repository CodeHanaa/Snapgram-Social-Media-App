import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetRecentPosts, useSearchPosts } from "@/lib/react-query/queries";
import type { IPost } from "@/Types";
import type { Models } from "appwrite";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");

  const { data: recentPosts, isPending: isLoadingRecent } = useGetRecentPosts();
  const { data: searchResults, isPending: isSearching } = useSearchPosts(searchValue);

  const posts = searchValue ? searchResults : recentPosts;
  const isLoading = searchValue ? isSearching : isLoadingRecent;

  return (
    <div className="flex flex-1 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-6">

        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <h2 className="h3-bold md:h2-bold">Explore</h2>
          <p className="text-light-3 text-sm">Discover posts from everyone</p>
        </div>

        {/* SEARCH BAR */}
        <div className="flex gap-3 items-center bg-dark-3 rounded-xl px-4 py-3 w-full">
          <img
            src="/assets/icons/search.svg"
            alt="search"
            className="w-5 h-5 opacity-60"
          />
          <input
            type="text"
            placeholder="Search by caption or hashtag..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-transparent text-white outline-none w-full text-sm placeholder:text-light-4"
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")}>
              <img
                src="/assets/icons/close.svg"
                alt="clear"
                className="w-4 h-4 opacity-60 hover:opacity-100 transition"
              />
            </button>
          )}
        </div>

        {/* RESULTS */}
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <p className="text-light-4">Loading...</p>
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center mt-10 gap-3">
            <img
              src="/assets/icons/search.svg"
              alt="no results"
              className="w-16 h-16 opacity-20"
            />
            <p className="text-light-4 text-center">No posts found</p>
          </div>
        ) : searchValue ? (
          // ✅ لو بيسرش → عرض PostCard كامل
          <ul className="flex flex-col gap-9 w-full">
            {posts.map((post: Models.Document) => {
              const typedPost = post as unknown as IPost;
              return (
                <li key={post.$id}>
                  <div className="post-card">
                    <Link to={`/posts/${post.$id}`}>
                      <img
                        src={String(typedPost.imageUrl)}
                        className="w-full rounded-xl object-cover max-h-[400px]"
                        alt="post"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/icons/profile-placeholder.svg";
                        }}
                      />
                      <p className="text-white mt-2 text-sm">{typedPost.caption}</p>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          // ✅ لو مفيش search → Grid من الصور
          <>
            <div className="flex justify-between items-center">
              <p className="text-light-2 font-semibold">
                {posts.length} Posts
              </p>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {posts.map((post: Models.Document) => {
                const typedPost = post as unknown as IPost;
                return (
                  <li
                    key={post.$id}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden group"
                  >
                    <Link to={`/posts/${post.$id}`} className="w-full h-full block">
                      <img
                        src={String(typedPost.imageUrl)}
                        alt="post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/icons/profile-placeholder.svg";
                        }}
                      />
                      {/* overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1 text-white text-sm">
                          <img src="/assets/icons/like.svg" className="w-5 h-5" alt="likes" />
                          <span>{typedPost.likes?.length || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;