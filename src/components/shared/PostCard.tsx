import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import type { Models } from "appwrite";
import type { IPost } from "@/Types";

import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";

import {
  getCommentsByPost,
  createComment,
} from "@/lib/Appwrite/Api";

import PostStats from "@/components/shared/PostStats";

/* ================= TYPES ================= */

type PostCardProps = {
  post: IPost;
};

type CommentType = Models.Document & {
  content: string;

  users?: {
    $id: string;
    name: string;
  };

  posts: string;
};

/* ================= COMPONENT ================= */

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isSending, setIsSending] = useState(false);

  const creator = post.creator ?? null;

  /* ================= LOAD COMMENTS ================= */
  useEffect(() => {
    let mounted = true;

    const loadComments = async () => {
      try {
        const data = await getCommentsByPost(post.$id);

        if (mounted) {
          setComments(data as CommentType[]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadComments();

    return () => {
      mounted = false;
    };
  }, [post.$id]);

  /* ================= DELETE POST ================= */
  const handleDelete = () => {
    deletePost(
      {
        postId: post.$id,
        imageId: post.imageId,
      },
      {
        onSuccess: () => {
          toast.success("Post deleted successfully");
          setIsConfirmOpen(false);
        },
        onError: () => {
          toast.error("Delete failed");
        },
      }
    );
  };

  /* ================= ADD COMMENT ================= */
  const handleSendComment = async () => {
    if (!comment.trim() || !user?.$id) return;

    setIsSending(true);

    try {
      await createComment({
        postId: post.$id,
        userId: user.$id,
        content: comment,
      });

      toast.success("Comment added");

      setComment("");
      setShowCommentInput(false);

      const updated = await getCommentsByPost(post.$id);
      setComments(updated as CommentType[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to comment");
    } finally {
      setIsSending(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="post-card relative">

      {/* DELETE MODAL */}
      {isConfirmOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="bg-dark-2 p-6 rounded-lg border border-dark-4 text-center">
            <h3 className="text-white mb-4">Delete this post?</h3>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator?.$id || ""}`}>
            <img
              src={
                creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              className="rounded-full w-12 h-12 object-cover"
              alt="creator"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium text-light-1">
              {creator?.name || "Unknown User"}
            </p>

            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>

              {post.location && (
                <>
                  •
                  <p className="subtle-semibold lg:small-regular">
                    {post.location}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* EDIT DELETE */}
        {user?.$id === creator?.$id && (
          <div className="flex-center gap-3">
            <Link to={`/update-post/${post.$id}`}>
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                width={20}
                height={20}
              />
            </Link>

            <button onClick={() => setIsConfirmOpen(true)}>
              <img
                src="/assets/icons/delete.svg"
                alt="delete"
                width={20}
                height={20}
              />
            </button>
          </div>
        )}
      </div>

      {/* BODY */}
      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>

          <ul className="flex gap-1 mt-2 flex-wrap">
            {post.tags?.map((tag: string) => (
              <li key={tag} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={post.imageUrl}
          className="post-card_img"
          alt="post"
        />
      </Link>

      {/* STATS */}
      <div className="mt-5">
        <PostStats post={post} userId={user?.$id || ""} />
      </div>

      {/* COMMENT BUTTON */}
      <div className="mt-4">
        <button onClick={() => setShowCommentInput(!showCommentInput)}>
          <img
            src="/assets/icons/chat.svg"
            width={24}
            height={24}
            alt="comment"
          />
        </button>
      </div>

      {/* COMMENTS */}
      <div className="mt-4 space-y-2">
        {comments.map((c) => (
          <div
            key={c.$id}
            className="bg-dark-3 p-2 rounded-lg text-light-2 text-sm"
          >
            <span className="font-bold text-primary-500">
              {c.users?.name || "User"}:
            </span>
            <span className="ml-1">{c.content}</span>
          </div>
        ))}
      </div>

      {/* INPUT */}
      {showCommentInput && (
        <div className="mt-4 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="bg-dark-3 text-light-1 w-full p-2 rounded-lg border border-dark-4"
          />

          <button
            onClick={handleSendComment}
            disabled={isSending}
            className="bg-primary-500 px-4 py-2 rounded-lg text-white"
          >
            {isSending ? "..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;