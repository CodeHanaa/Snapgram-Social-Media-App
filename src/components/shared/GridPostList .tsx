import { Link } from "react-router-dom";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";

type Post = {
  $id: string;
  imageId: string;
};

type Props = {
  posts: Post[];
};

const GridPostList = ({ posts }: Props) => {
  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.$id}>
          <Link to={`/posts/${post.$id}`}>
            <img
              src={
                post.imageId
                  ? appwriteService.storage.getFilePreview(
                      appwriteConfig.storageId,
                      post.imageId
                    )
                  : "/assets/icons/profile-placeholder.svg"
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