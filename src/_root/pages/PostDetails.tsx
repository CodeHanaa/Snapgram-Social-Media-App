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
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isPending } = useGetPostById(id || "");
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
          navigate("/");
        },
        onError: () => {
          toast.error("Failed to delete post.");
          setIsConfirmOpen(false);
        },
      }
    );
  };

  if (isPending) return <Loader />;

  if (!post) {
    return (
      <h1 className="text-white text-center mt-10">
        Post not found
      </h1>
    );
  }

  return (
    <div className="post_details-container">
      
      {/* Back button */}
      <div className="hidden md:flex w-full max-w-5xl mb-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost"
        >
          <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
          <p className="small-medium lg:base-medium ml-2">Back</p>
        </Button>
      </div>

      <div className="post_details-card flex flex-col md:flex-row gap-10 w-full max-w-5xl">

        {/* IMAGE */}
        <img
          src={post.imageUrl}
          alt="post"
          className="post_details-img"
        />

        {/* CONTENT */}
        <div className="post_details-info flex flex-col gap-5 w-full">

          {/* CREATOR */}
          <div className="flex-between w-full">
            <Link to={`/profile/${post.users?.$id}`} className="flex items-center gap-3">
              <img
                src={post.users?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="creator"
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
              />
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-light-1">
                  {post.users?.name}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post.$createdAt)}
                  </p>
                </div>
              </div>
            </Link>

            {/* ACTIONS */}
            {user.$id === post.users?.$id && (
              <div className="flex items-center gap-2">
                <Link to={`/update-post/${post.$id}`}>
                  <img src="/assets/icons/edit.svg" width={24} height={24} alt="edit" />
                </Link>

                <button onClick={() => setIsConfirmOpen(true)} className="ghost_details-delete_btn">
                  <img src="/assets/icons/delete.svg" width={24} height={24} alt="delete" />
                </button>
              </div>
            )}
          </div>

          <hr className="border w-full border-dark-4/80" />

          {/* CAPTION */}
          <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
            <p>{post.caption}</p>
            <ul className="flex gap-1 mt-2">
              {post.tags?.map((tag: string) => (
                <li key={tag} className="text-light-3 small-regular">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-dark-2 p-6 rounded-xl flex flex-col items-center">
            <p className="mb-4 text-light-1">Are you sure you want to delete this post?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="bg-dark-4 px-4 py-2 rounded-lg text-white"
              >
                No
              </button>
              <button 
                onClick={handleDelete}
                className="bg-red-500 px-4 py-2 rounded-lg text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;