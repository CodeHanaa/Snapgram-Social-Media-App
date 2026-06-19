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

  const postId = id; // وضوح أكتر

  const { data: post, isPending } = useGetPostById(postId || "");

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

  if (!postId || isPending) return <Loader />;

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
          onClick={() => navigate("/")}
          variant="ghost"
        >
          Back
        </Button>
      </div>

      <div className="post_details-card flex flex-col md:flex-row gap-10 w-full max-w-5xl">

        {/* IMAGE */}
        <div className="md:w-1/2 w-full">
          <img
            src={post.imageUrl}
            className="w-full rounded-xl object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="md:w-1/2 w-full flex flex-col gap-4">

          {/* CREATOR */}
          <Link to={`/profile/${post.creator?.$id}`}>
            <div className="flex gap-3 items-center">
              <img
                src={post.creator?.imageUrl}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p>{post.creator?.name}</p>
                <p>{multiFormatDateString(post.$createdAt)}</p>
              </div>
            </div>
          </Link>

          {/* ACTIONS */}
          {user.$id === post.creator?.$id && (
            <div className="flex gap-2">
              <Link to={`/update-post/${post.$id}`}>
                Edit
              </Link>

              <button onClick={() => setIsConfirmOpen(true)}>
                Delete
              </button>
            </div>
          )}

          {/* CAPTION */}
          <p>{post.caption}</p>

          {/* TAGS */}
          <div className="flex gap-2 flex-wrap">
            {post.tags?.map((tag: string) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-dark-2 p-6 rounded-xl">
            <p className="mb-4">Are you sure?</p>

            <div className="flex gap-4">
              <button onClick={() => setIsConfirmOpen(false)}>
                No
              </button>

              <button onClick={handleDelete}>
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