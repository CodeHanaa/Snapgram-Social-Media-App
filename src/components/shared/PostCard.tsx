import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

import type { IPost } from "@/Types";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import PostStats from "@/components/shared/PostStats";

type PostCardProps = {
  post: IPost;
  savedRecordId?: string;
  onUnsave?: (postId: string) => void;
};

const PostCard = ({ post, savedRecordId, onUnsave }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost, isPending } = useDeletePost();
  const [showConfirm, setShowConfirm] = useState(false);

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
          setShowConfirm(false);
        },
        onError: () => {
          toast.error("Delete failed");
          setShowConfirm(false);
        },
      }
    );
  };

  return (
    <>
      <div className="post-card">

        {/* ===== HEADER ===== */}
        <div className="flex-between">
          <Link to={`/posts/${post.$id}`} className="flex items-center gap-3">
            <img
              src={creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              className="w-12 h-12 rounded-full"
              alt="user"
            />
            <div>
              <p className="text-white">{creator?.name || "Unknown User"}</p>
              <p className="text-gray-400 text-sm">
                {multiFormatDateString(post.$createdAt)}
              </p>
            </div>
          </Link>

          {/* edit / delete */}
          {user?.$id === creatorId && (
            <div className="flex gap-3">
              <Link to={`/update-post/${post.$id}`}>
                <img src="/assets/icons/edit.svg" alt="edit" className="w-5 h-5" />
              </Link>
              <button onClick={() => setShowConfirm(true)}>
                <img src="/assets/icons/delete.svg" alt="delete" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* ===== CAPTION ===== */}
        <Link to={`/posts/${post.$id}`}>
          <p className="mt-3 text-white">{post.caption}</p>
        </Link>

        {/* ===== IMAGE ===== */}
        <Link to={`/posts/${post.$id}`}>
          <img
            src={String(post.imageUrl)}
            className="w-full rounded-xl mt-3 object-cover max-h-100"
            alt="post"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/icons/profile-placeholder.svg";
            }}
          />
        </Link>

        {/* ===== STATS ===== */}
        <div className="mt-4">
          <PostStats
            post={post}
            userId={user?.$id || ""}
            savedRecordId={savedRecordId}
            onUnsave={onUnsave}
          />
        </div>
      </div>

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-dark-2 border border-dark-4 rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <img
                  src="/assets/icons/delete.svg"
                  alt="delete"
                  className="w-7 h-7"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-white font-semibold text-lg">Delete Post</h3>
              <p className="text-light-3 text-sm">
                Are you sure you want to delete this post?
                <br />
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-dark-3 hover:bg-dark-4 text-white text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;