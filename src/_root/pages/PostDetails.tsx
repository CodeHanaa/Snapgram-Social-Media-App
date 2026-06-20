import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetPostById, useDeletePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import { toast } from "sonner";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isPending } = useGetPostById(id || "");
  const { mutate: deletePost } = useDeletePost();

  if (isPending) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  const creatorId =
    typeof post.creator === "string"
      ? post.creator
      : post.creator?.$id;

  const handleDelete = () => {
    deletePost(
      { postId: post.$id, imageId: post.imageId },
      {
        onSuccess: () => {
          toast.success("Deleted");
          navigate("/");
        },
      }
    );
  };

  return (
    <div className="post-details">

      {/* BACK */}
      <button onClick={() => navigate(-1)}>
        Back
      </button>

      {/* IMAGE */}
      <img src={post.imageUrl} />

      {/* CAPTION */}
      <p>{post.caption}</p>

      {/* ACTIONS */}
      {user?.$id === creatorId && (
        <div className="flex gap-3 mt-4">
          <Link to={`/update-post/${post.$id}`}>
            Edit
          </Link>

          <button onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}

    </div>
  );
};

export default PostDetails;