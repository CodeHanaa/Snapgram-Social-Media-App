import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetRecentPosts, useSearchPosts } from "@/lib/react-query/queries";
import type { IPost } from "@/Types";
import type { Models } from "appwrite";
import Loader from "@/components/shared/Loader";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");

  const { data: recentPosts, isPending: isLoadingRecent } = useGetRecentPosts();
  const { data: searchResults, isPending: isSearching } = useSearchPosts(searchValue);

  const posts = searchValue ? searchResults : recentPosts;
  const isLoading = searchValue ? isSearching : isLoadingRecent;

  // Handle tag click — set search value to the tag
  const handleTagClick = (tag: string) => {
    setSearchValue(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            placeholder="Search by caption or tag..."
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

        {/* ACTIVE TAG FILTER */}
        {searchValue && (
          <div className="flex items-center gap-2">
            <span className="text-light-3 text-sm">Searching for:</span>
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              {searchValue}
            </span>
            <button
              onClick={() => setSearchValue("")}
              className="text-light-4 hover:text-white text-xs transition"
            >
              Clear
            </button>
          </div>
        )}

        {/* RESULTS */}
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader />
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
          // Search results — list view with tags
          <ul className="flex flex-col gap-6 w-full">
            {posts.map((post: Models.Document) => {
              const typedPost = post as unknown as IPost;
              return (
                <li key={post.$id} className="post-card">
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

                  {/* Clickable tags */}
                  {typedPost.tags && typedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {typedPost.tags.map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="text-purple-400 hover:text-purple-300 text-xs transition"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          // Default grid view with tags on hover
          <>
            <div className="flex justify-between items-center">
              <p className="text-light-2 font-semibold">{posts.length} Posts</p>
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

                      {/* Hover overlay with likes and tags */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-3">
                        <div className="flex items-center gap-1 text-white text-sm">
                          <img src="/assets/icons/like.svg" className="w-5 h-5" alt="likes" />
                          <span>{typedPost.likes?.length || 0}</span>
                        </div>

                        {/* Tags on hover */}
                        {typedPost.tags && typedPost.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {typedPost.tags.slice(0, 3).map((tag: string) => (
                              <button
                                key={tag}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleTagClick(tag);
                                }}
                                className="text-purple-300 hover:text-white text-xs transition"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
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