import React, { useState } from 'react';
import type { Models } from "appwrite";
import { useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked } from "@/lib/utils";
// تأكدي من استيراد هذه الدوال من ملف الـ API
import { savePost, deleteSavedPost } from "@/lib/Appwrite/Api"; 

type PostDocument = Models.Document & { likes: Array<Pick<Models.Document, "$id">> };

type PostStatsProps = {
  post: PostDocument;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = (post.likes || []).map((user) => user.$id);
  const [likes, setLikes] = useState<string[]>(likesList);
  
  // حالات الحفظ
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState("");

  const { mutate: likePost } = useLikePost();

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
    likePost({ postId: post.$id, likesArray: newLikes });
  };

  const handleSavePost = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSaved) {
      // إلغاء الحفظ
      setIsSaved(false);
      await deleteSavedPost(savedRecordId);
    } else {
      // حفظ
      setIsSaved(true);
      const newSave = await savePost(post.$id, userId);
      setSavedRecordId(newSave?.$id || "");
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      {/* جزء اللايك */}
      <div className="flex gap-2 mr-5">
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

      {/* جزء الحفظ البرمجي */}
      <div className="flex gap-2">
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
  );
};

export default PostStats;