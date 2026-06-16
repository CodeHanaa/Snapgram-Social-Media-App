import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { IPost } from "@/Types";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";
import { getCommentsByPost, createComment } from "@/lib/Appwrite/Api";
import PostStats from "@/components/shared/PostStats";

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const fetchComments = async () => {
    const data = await getCommentsByPost(post.$id);
    if (data) setComments(data);
  };

  useEffect(() => {
    const loadComments = async () => {
      const data = await getCommentsByPost(post.$id);
      if (data) {
        setComments(data);
      }
    };
    loadComments();
  }, [post.$id]);

  const handleDelete = () => {
  console.log("البيانات المرسلة للحذف:");
  console.log("Post ID:", post.$id);
  console.log("Image ID:", post.imageId);

  deletePost(
    { postId: post.$id, imageId: post.imageId },
    {
      onSuccess: () => {
        toast.success("Post deleted successfully!");
        setIsConfirmOpen(false);
        window.location.reload(); 
      },
      onError: (err) => {
        console.error("خطأ الحذف من Appwrite:", err);
        toast.error("فشل الحذف، راجعي الـ Console");
      }
    }
  );
};

  const handleSendComment = async () => {
    if (!comment.trim()) return;

    await createComment({ 
      postId: post.$id, 
      userId: user.$id, 
      content: comment 
    });
    
    toast.success("Comment added successfully!");
    setComment("");
    setShowCommentInput(false);
    fetchComments(); 
  };

  const creator = post.creator;

  return (
    <div className="post-card relative">
      {/* نافذة التأكيد */}
      {isConfirmOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="bg-dark-2 p-6 rounded-lg text-center border border-dark-4">
            <h3 className="text-white mb-4">Are you sure?</h3>
            <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-gray-600 rounded mr-2">No</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded">Yes</button>
          </div>
        </div>
      )}

      {/* الرأس */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator?.$id}`}>
            <img src={creator?.imageUrl || "/assets/icons/profile-placeholder.svg"} className="rounded-full w-12 h-12 object-cover" alt="creator" />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium text-light-1">{creator?.name || "Unknown User"}</p>
            <p className="small-regular text-light-3">{multiFormatDateString(post.$createdAt)}</p>
          </div>
        </div>

        {/* أيقونات التعديل والحذف */}
        {user.$id === creator?.$id && (
          <div className="flex gap-2">
            <Link to={`/update-post/${post.$id}`}>
              <img src="/assets/icons/edit.svg" width={20} height={20} alt="edit" />
            </Link>
            <button onClick={() => setIsConfirmOpen(true)}>
              <img src="/assets/icons/delete.svg" width={20} height={20} alt="delete" />
            </button>
          </div>
        )}
      </div>

      {/* المحتوى */}
      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2 flex-wrap">
            {post.tags?.map((tag: string) => (<li key={tag} className="text-light-3">#{tag}</li>))}
          </ul>
        </div>
        <img src={post.imageUrl} className="post-card_img" alt="post" />
      </Link>

      {/* التفاعلات */}
      <div className="flex items-center gap-4 mt-4">
        <PostStats post={post} userId={user.$id} />
        
        <button onClick={() => setShowCommentInput(!showCommentInput)}>
          <img src="/assets/icons/chat.svg" width={24} height={24} alt="comment" />
        </button>
      </div>

      {/* التعليقات */}
      <div className="mt-4 space-y-2">
        {comments.map((c) => (
          <div key={c.$id} className="text-light-2 text-sm bg-dark-3 p-2 rounded-lg">
            <span className="font-bold text-primary-500">{c.creator?.name || "User"}: </span>
            {c.content}
          </div>
        ))}
      </div>

      {/* حقل الإدخال */}
      {showCommentInput && (
        <div className="mt-4 flex gap-2">
          <input 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..." 
            className="bg-dark-3 text-light-1 w-full p-2 rounded-lg border border-dark-4 focus:outline-none"
          />
          <button onClick={handleSendComment} className="bg-primary-500 px-4 py-2 rounded-lg text-white">Send</button>
        </div>
      )}
    </div>
  );
};

export default PostCard;