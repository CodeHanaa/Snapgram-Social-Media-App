import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetPostById, useDeletePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import { multiFormatDateString } from "@/lib/utils";
import PostStats from "@/components/shared/PostStats";
import { toast } from "sonner";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isPending } = useGetPostById(id || "");
  const { mutate: deletePost } = useDeletePost();
  const [showConfirm, setShowConfirm] = useState(false);

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-light-2">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-light-2">Post not found</p>
      </div>
    );
  }

  const creator =
    typeof post.creator === "object" && post.creator !== null
      ? post.creator
      : null;

  const creatorId = creator?.$id ?? (post.creator as string);

  const handleDelete = () => {
    deletePost(
      { postId: post.$id, imageId: post.imageId },
      {
        onSuccess: () => {
          toast.success("Post deleted");
          navigate("/");
        },
        onError: () => toast.error("Failed to delete"),
      }
    );
  };

  return (
    <div className="flex flex-1 gap-10 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-5xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-light-2 mb-8 hover:text-white transition w-fit"
        >
          <img src="/assets/icons/back.svg" alt="back" className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-dark-2 rounded-3xl overflow-hidden flex flex-col lg:flex-row">

          {/* IMAGE */}
          <div className="lg:w-1/2 bg-dark-3 flex items-center justify-center min-h-[300px]">
            <img
              src={String(post.imageUrl)}
              alt="post"
              className="w-full h-full object-cover max-h-125 lg:max-h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/icons/profile-placeholder.svg";
              }}
            />
          </div>

          {/* DETAILS */}
          <div className="lg:w-1/2 flex flex-col p-6 gap-5">

            {/* CREATOR */}
            <div className="flex justify-between items-start">
              <Link
                to={`/profile/${creatorId}`}
                className="flex items-center gap-3"
              >
                <img
                  src={creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="creator"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-semibold">
                    {creator?.name || "Unknown User"}
                  </p>
                  <p className="text-light-3 text-sm">
                    {multiFormatDateString(post.$createdAt)}
                    {post.location && ` · ${post.location}`}
                  </p>
                </div>
              </Link>

              {/* EDIT / DELETE */}
              {user?.$id === creatorId && (
                <div className="flex gap-3 items-center">
                  <Link to={`/update-post/${post.$id}`}>
                    <img
                      src="/assets/icons/edit.svg"
                      alt="edit"
                      className="w-5 h-5 hover:opacity-70 transition"
                    />
                  </Link>
                  <button onClick={() => setShowConfirm(true)}>
                    <img
                      src="/assets/icons/delete.svg"
                      alt="delete"
                      className="w-5 h-5 hover:opacity-70 transition"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* CAPTION */}
            <p className="text-white text-sm leading-relaxed">{post.caption}</p>

            {/* TAGS */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-light-3 text-sm">
                    #{tag.replace("#", "")}
                  </span>
                ))}
              </div>
            )}

            {/* STATS */}
            <div className="mt-auto pt-4 border-t border-dark-4">
              <PostStats post={post} userId={user?.$id || ""} />
            </div>
          </div>
        </div>
      </div>

      {/*  Confirm Delete Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-dark-2 rounded-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-white text-lg font-semibold">
                Delete Post
              </h3>
              <p className="text-light-3 text-sm">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-dark-4 text-light-2 hover:bg-dark-3 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleDelete();
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition text-sm font-semibold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;