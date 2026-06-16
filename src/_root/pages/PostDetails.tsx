import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetPostById, useDeletePost } from "@/lib/react-query/queries";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/Context/useAuthContext";
import { Button } from "@/components/ui/button";
import { multiFormatDateString } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { mutate: deletePost } = useDeletePost();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (!post) return;
    deletePost(
      { postId: post.$id, imageId: post.imageId },
      {
        onSuccess: () => {
          toast.success("Post deleted successfully!");
          setIsConfirmOpen(false);
          navigate('/');
        },
        onError: () => {
          toast.error("Failed to delete post.");
          setIsConfirmOpen(false);
        },
      }
    );
  };

  if (isPending) return <Loader />;

  return (
    <div className="post_details-container">
      {/* 1. زر الرجوع - منفصل في الأعلى */}
      <div className="hidden md:flex w-full max-w-5xl mb-6">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="shad-button_ghost flex gap-2 items-center text-light-3 hover:text-white transition"
        >
          <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
          <p className="base-medium">Back to Home</p>
        </Button>
      </div>

      {post ? (
        <div className="post_details-card flex flex-col md:flex-row gap-10 w-full max-w-5xl">
          
          {/* 2. صورة البوست - تم تقييدها بـ Container ثابت */}
          <div className="md:w-1/2 w-full flex-center bg-dark-1 rounded-2xl p-2">
            <img 
              src={post.imageUrl || "/assets/icons/profile-placeholder.svg"} 
              alt="post" 
              className="w-full h-auto max-h-[500px] rounded-[24px] object-cover" 
            />
          </div>

          {/* 3. بيانات البوست */}
          <div className="md:w-1/2 w-full flex flex-col justify-start gap-5">
            <div className="flex-between w-full">
              <Link to={`/profile/${post.creator?.$id}`} className="flex items-center gap-3">
                <img
                  src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  className="rounded-full w-12 h-12 object-cover"
                  alt="creator"
                />
                <div className="flex flex-col">
                  <p className="base-medium text-light-1">{post.creator?.name || "Unknown User"}</p>
                  <p className="small-regular text-light-3">{multiFormatDateString(post.$createdAt)}</p>
                </div>
              </Link>

              {/* أزرار التعديل والحذف */}
              {user.id === post.creator?.$id && (
                <div className="flex gap-2">
                  <Link to={`/update-post/${post.$id}`} className="p-2 hover:opacity-80">
                    <img src="/assets/icons/edit.svg" width={20} height={20} alt="edit" />
                  </Link>
                  <button onClick={() => setIsConfirmOpen(true)} className="p-2 hover:opacity-80">
                    <img src="/assets/icons/delete.svg" alt="delete" width={20} height={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="small-medium lg:base-medium py-3 border-t border-dark-4">
              <p>{post.caption}</p>
              <ul className="flex gap-1 mt-2 flex-wrap">
                {post.tags?.map((tag: string) => (
                  <li key={tag} className="text-light-3">#{tag}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-white">Post not found!</h1>
      )}

      {/* مودال الحذف */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/70">
          <div className="bg-dark-2 p-8 rounded-2xl text-center border border-dark-4 max-w-sm">
            <h3 className="text-white mb-6">Are you sure?</h3>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsConfirmOpen(false)} className="shad-button_dark_4 px-4 py-2">No</button>
              <button onClick={handleDelete} className="shad-button_primary bg-red-500 px-4 py-2">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;