import React, { useState, useEffect, useRef } from "react";
import type { Models } from "appwrite";
import { toast } from "sonner";

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/posts/${post.$id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 1500);
    });
  };

  const handleShareWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/posts/${post.$id}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Check this post 👇\n" + postUrl)}`,
      "_blank"
    );
    setShowShareMenu(false);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/posts/${post.$id}`;
    if (navigator.share) {
      await navigator.share({ title: "Check this post!", url: postUrl });
      setShowShareMenu(false);
    } else {
      handleCopyLink(e);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-4 items-center">

          {/* ❤️ Like */}
          <div className="flex gap-2 items-center">
            <img
              src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
              onClick={handleLikePost}
              className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{likes.length}</p>
          </div>

          {/* 💬 Comment */}
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

          {/* 🔗 Share */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu((prev) => !prev);
              }}
              className="flex items-center text-light-3 hover:text-white transition"
              title="Share"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>

            {/* Share dropdown */}
            {showShareMenu && (
              <div className="absolute bottom-8 left-0 bg-dark-2 border border-dark-4 rounded-2xl p-2 flex flex-col gap-1 w-52 z-50 shadow-2xl">

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 text-white text-sm px-3 py-2.5 hover:bg-dark-3 rounded-xl transition text-left"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#877eff" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                  )}
                  {copied ? "Copied!" : "Copy link"}
                </button>

                {/* Share via WhatsApp */}
                <button
                  onClick={handleShareWhatsapp}
                  className="flex items-center gap-3 text-white text-sm px-3 py-2.5 hover:bg-dark-3 rounded-xl transition text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.732.886.939-3.629-.235-.374A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  WhatsApp
                </button>

                {/* Native Share */}
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 text-white text-sm px-3 py-2.5 hover:bg-dark-3 rounded-xl transition text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  Share
                </button>

              </div>
            )}
          </div>
        </div>

        {/* 🔖 Save */}
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

      {/* 💬 Comments Modal */}
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