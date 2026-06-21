import { useParams } from "react-router-dom";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import type { IPost } from "@/Types";

const EditPost = () => {
  // Get the post ID from the URL params
  const { id } = useParams();

  // Fetch the post data by ID using React Query
  const { data: post, isPending } = useGetPostById(id || "");

  // Show loading state while fetching
  if (isPending) return <div className="text-white flex-center w-full h-full">Loading...</div>;

  // Show error state if post was not found
  if (!post) return <div className="text-white">Post not found.</div>;

  return (
    <div className="flex flex-1">
      <div className="common-container">

        {/* Page header with edit icon and title */}
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        {/* Pass the post data to PostForm with "Update" action
            Cast to IPost to match the expected type in the form */}
        <PostForm action="Update" post={post as IPost} />

      </div>
    </div>
  );
};

export default EditPost;