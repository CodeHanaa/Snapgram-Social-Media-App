import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetPostById } from "@/lib/react-query/queries";
import Loader from "@/components/shared/Loader";
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
          <img src={post.imageUrl} alt="post" className="post_details-img" />
          
          <div className="post_details-info">
            <div className="flex-between w-full">
              <div className="flex flex-col">
                <h2 className="h3-bold md:h2-bold text-light-1">{post.caption}</h2>
                <p className="text-light-3 small-regular">{post.location}</p>
              </div>

              {user.id === post.creator?.$id && (
                <Link to={`/update-post/${post.$id}`} className="flex gap-2 text-primary-500 hover:text-primary-600 transition">
                  <img src="/assets/icons/edit.svg" width={24} height={24} alt="edit" />
                </Link>
              )}
            </div>

            <div className="mt-8">
              {/* هنا الزر بالتعديل المطلوب */}
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="shad-button_ghost flex gap-2 items-center text-light-3 hover:text-white transition cursor-pointer"
              >
                <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
                <p className="small-medium lg:base-medium">Back</p>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-white">Post not found!</h1>
      )}
    </div>
  );
};

export default PostDetails;