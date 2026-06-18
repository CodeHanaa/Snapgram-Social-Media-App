import React, { useState, useEffect } from "react";
import type { Models } from "appwrite";

import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked } from "@/lib/utils";

import {
  savePost,
  deletePost,
  getCommentsByPost,
} from "@/lib/Appwrite/Api";

// تعريف نوع التعليق لضمان سلامة الـ TypeScript
type CommentType = {
  $id: string;
  content: string;
  users?: {
    $id: string;
    name: string;
  };
  posts: string;
};

type PostDocument = Models.Document & {
  likes: string[];
};

type PostStatsProps = {
  post: PostDocument;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const { mutate: likePost } = useLikePost();

  const likesList = post.likes || [];
  const [likes, setLikes] = useState<string[]>(likesList);

  const [isSaved, setIsSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState("");

  // تم استبدال any بـ CommentType[]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        const data = await getCommentsByPost(post.$id);

        if (isMounted && data) {
          setComments(data as CommentType[]);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [post.$id]);

  // ❤️ Like handler
  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let newLikes = [...likes];

    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);

    likePost({
      postId: post.$id,
      likesArray: newLikes,
    });
  };

  // 🔖 Save handler
  const handleSavePost = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSaved) {
      setIsSaved(false);
      // تأكدي أن الـ Api.ts يقبل معاملين في دالة deletePost كما في الكود
      await deletePost(savedRecordId, ""); 
    } else {
      setIsSaved(true);
      const newSave = await savePost(post.$id, userId);
      setSavedRecordId(newSave?.$id || "");
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      {/* ❤️ likes */}
      <div className="flex gap-2 mr-5">
        <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />

        <p className="small-medium lg:base-medium">
          {likes.length}
        </p>
      </div>

      {/* 🔖 save */}
      <div className="flex gap-2">
        <img
          src={
            isSaved
              ? "/assets/icons/saved.svg"
              : "/assets/icons/save.svg"
          }
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleSavePost}
        />
      </div>
    </div>
  );
};

export default PostStats;