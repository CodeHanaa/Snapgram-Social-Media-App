import { useGetLikedPosts } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";
import type { Models } from "appwrite";

type LikedPost = Models.Document & {
  imageUrl: string;
  likes: string[];
};

const LikedPosts = () => {
  const { user } = useUserContext();
  const { data: likedPosts, isPending } = useGetLikedPosts(user.$id);

  if (isPending) return <div className="flex items-center justify-center w-full mt-10"><Loader /></div>;

  if (!likedPosts || likedPosts.length === 0) {
    return <p className="text-light-4 text-center mt-10">No liked posts yet</p>;
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {(likedPosts as unknown as LikedPost[]).map((post) => (
        <li key={post.$id} className="relative w-full aspect-square rounded-2xl overflow-hidden group">
          <Link to={`/posts/${post.$id}`} className="w-full h-full block">
            <img
              src={post.imageUrl}
              alt="liked post"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/icons/profile-placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <div className="flex items-center gap-1 text-white text-sm">
                <img src="/assets/icons/like.svg" className="w-5 h-5" alt="likes" />
                <span>{post.likes?.length || 0}</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default LikedPosts;