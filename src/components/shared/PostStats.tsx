import React, { useState, useEffect, useRef } from "react";
import type { Models } from "appwrite";

import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked } from "@/lib/utils";
import {
  savePost,
  deleteSavePost,
  getCommentsByPost,
  createComment,
} from "@/lib/Appwrite/Api";

type CommentType = {
  $id: string;
  content: string;
  users?: { $id: string; name: string };
  posts: string;
};

type PostDocument = Models.Document & {
  likes: string[];
};

type PostStatsProps = {
  post: PostDocument;
  userId: string;
  savedRecordId?: string;
  onUnsave?: (postId: string) => void;
};

const PostStats = ({ post, userId, savedRecordId: initialSavedId, onUnsave }: PostStatsProps) => {
  const { mutate: likePost } = useLikePost();

  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isSaved, setIsSaved] = useState(!!initialSavedId);
  const [savedRecordId, setSavedRecordId] = useState(initialSavedId || "");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      try {
        const data = await getCommentsByPost(post.$id);
        if (isMounted && data) setComments(data as CommentType[]);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };
    loadComments();
    return () => { isMounted = false; };
  }, [post.$id]);

  useEffect(() => {
    if (showComments) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showComments]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const hasLiked = likes.includes(userId);
    const newLikes = hasLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likePost({ postId: post.$id, likesArray: newLikes });
  };

  const handleSavePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      setIsSaved(false);
      await deleteSavePost(savedRecordId);
      // ✅ لو في صفحة Saved، شيل البوست من الـ list
      onUnsave?.(post.$id);
    } else {
      setIsSaved(true);
      const newSave = await savePost(post.$id, userId);
      setSavedRecordId(newSave?.$id || "");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      const created = await createComment({
        postId: post.$id,
        userId,
        content: newComment.trim(),
      });

      setComments((prev) => [
        ...prev,
        {
          $id: created.$id,
          content: newComment.trim(),
          posts: post.$id,
          users: { $id: userId, name: "You" },
        },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <img
              src={checkIsLiked(likes, userId)
                ? "/assets/icons/liked.svg"
                : "/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
              onClick={handleLikePost}
              className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{likes.length}</p>
          </div>

          <div className="flex gap-2 items-center">
            <img
              src="/assets/icons/chat.svg"
              alt="comment"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => setShowComments(true)}
            />
            <p className="small-medium lg:base-medium">{comments.length}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={handleSavePost}
          />
        </div>
      </div>

      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowComments(false)}
        >
          <div
            className="bg-dark-2 rounded-2xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">
                Comments ({comments.length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto flex-1">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.$id}
                    className="flex gap-3 items-start bg-dark-3 rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {comment.users?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">
                        {comment.users?.name || "User"}
                      </p>
                      <p className="text-white text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="flex gap-2 items-center border-t border-dark-4 pt-4"
            >
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark-3 text-white rounded-xl px-4 py-2 text-sm outline-none border border-dark-4 focus:border-purple-500 transition"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition"
              >
                {isSubmitting ? "..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PostStats;