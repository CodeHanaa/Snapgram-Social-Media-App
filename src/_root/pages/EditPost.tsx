import { useParams } from "react-router-dom";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import type { IPost } from "@/Types"; // استيراد النوع

const EditPost = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");

  if (isPending) return <div className="text-white flex-center w-full h-full">Loading...</div>;

  // في حالة لم يتم العثور على البوست
  if (!post) return <div className="text-white">Post not found.</div>;

  return (
    <div className="flex flex-1">
      <div className="common-container">
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

        {/* تمرير البوست مع تحويل النوع لـ IPost ليتوافق مع الـ Form */}
        <PostForm action="Update" post={post as IPost} />
      </div>
    </div>
  );
};

export default EditPost;