import { Link } from "react-router-dom";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";

type Post = {
  $id: string;
  imageId: string;
  imageUrl?: string;
};

type Props = {
  posts: Post[];
};

const GridPostList = ({ posts }: Props) => {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-6">
      {posts.map((post) => (
        <li key={post.$id} className="relative w-full h-64 rounded-2xl overflow-hidden">
          <Link to={`/posts/${post.$id}`} className="w-full h-full block">
            <img
              src={
                post.imageUrl
                  ? String(post.imageUrl)
                  : post.imageId
                  ? appwriteService.storage
                      .getFileView(appwriteConfig.storageId, post.imageId)
                      .toString()
                  : "/assets/icons/profile-placeholder.svg"
              }
              alt="post"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/icons/profile-placeholder.svg";
              }}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;