import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { IPost } from "@/Types";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State للتحكم في ظهور الرسالة

  const handleDelete = () => {
    deletePost(
      { postId: post.$id, imageId: post.imageId },
      {
        onSuccess: () => {
          toast.success("Post deleted successfully!");
          setIsConfirmOpen(false);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to delete post.");
          setIsConfirmOpen(false);
        },
      }
    );
  };

  const creator = post.creator;

  return (
    <div className="post-card relative">
      {/* نافذة التأكيد المخصصة */}
      {isConfirmOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="bg-dark-2 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-white mb-4">هل أنت متأكد من مسح البوست؟</h3>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded">لا</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">نعم</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator?.$id}`}>
            <img
              src={creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              className="rounded-full w-12 h-12 object-cover"
              alt="creator"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium text-light-1">{creator?.name || "Unknown User"}</p>
            <div className="flex-center gap-2 text-light-3">
              <p className="small-regular">{multiFormatDateString(post.$createdAt)}</p>
            </div>
          </div>
        </div>

        {user.$id === creator?.$id && (
          <button
            onClick={() => setIsConfirmOpen(true)} // فتح النافذة بدل الكود القديم
            className="p-2 rounded-lg cursor-pointer hover:opacity-80"
          >
            <img src="/assets/icons/delete.svg" alt="delete" width={20} height={20} />
          </button>
        )}
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2 flex-wrap">
            {post.tags?.map((tag: string) => (
              <li key={tag} className="text-light-3">#{tag}</li>
            ))}
          </ul>
        </div>
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="post-card_img"
          alt="post"
        />
      </Link>
    </div>
  );
};

export default PostCard;