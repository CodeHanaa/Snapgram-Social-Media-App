import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/shared/Loader";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/Context/useAuthContext";
import { Button } from "@/components/ui/button";

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();
  const navigate = useNavigate();

  if (isPending) return <Loader />;

  return (
    <div className="post_details-container">
      {post ? (
        <div className="post_details-card">
          <img src={post?.imageUrl} alt="post" className="post_details-img" />
          
          <div className="post_details-info">
            <div className="flex-between w-full">
              {/* استخدام ?. للوصول للـ creator بشكل آمن */}
              <Link to={`/profile/${post?.creator?.$id}`} className="flex items-center gap-3">
                <img
                  src={post?.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="creator"
                  className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                />
                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">{post?.creator?.name}</p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">{post?.$createdAt ? multiFormatDateString(post.$createdAt) : ''}</p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                {/* المقارنة هنا آمنة لأننا نستخدم user.id ونقارنها بـ post.creator.$id */}
                {user.id === post?.creator?.$id && (
                  <Link to={`/update-post/${post?.$id}`} className="flex gap-3 items-center">
                    <img src="/assets/icons/edit.svg" width={24} height={24} alt="edit" />
                  </Link>
                )}
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags?.map((tag: string) => (
                  <li key={tag} className="text-light-3 small-regular">#{tag}</li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <Button onClick={() => navigate('/')} variant="ghost" className="shad-button_ghost">
                <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
                <p className="small-medium lg:base-medium">Back</p>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white">Post not found</div>
      )}
    </div>
  );
};

export default PostDetails;