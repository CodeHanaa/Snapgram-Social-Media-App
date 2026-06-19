import { Link } from "react-router-dom";
import type { Models } from "appwrite";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config"; // عدل المسار

type Post = Models.Document & {
  imageId: string;
};

const GridPostList = ({ posts }: { posts: Post[] }) => {
  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.$id} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.$id}`} className="grid-post_link">
            <img
              src={
                post.imageId
                  ? appwriteService.storage.getFilePreview(
                      appwriteConfig.storageId,
                      post.imageId
                    )
                  : "/placeholder.png"
              }
              alt="post"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;