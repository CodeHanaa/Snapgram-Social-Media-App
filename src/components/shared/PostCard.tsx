import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import type { IPost } from "@/Types";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import { multiFormatDateString } from "@/lib/utils";

import PostStats from "@/components/shared/PostStats";

type UserType = {
  $id: string;
  name: string;
  imageUrl: string;
};

const PostCard = ({ post }: { post: IPost }) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();

  const [creatorData, setCreatorData] = useState<UserType | null>(null);

  const creatorId =
    typeof post.creator === "string"
      ? post.creator
      : post.creator?.$id;

  useEffect(() => {
    const fetchCreator = async () => {
      if (!creatorId) return;

      try {
        const res = await appwriteService.databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          creatorId
        );

        // تم التعديل هنا باستخدام unknown
        setCreatorData(res as unknown as UserType);
      } catch (error) {
        console.log("creator fetch error:", error);
      }
    };

    fetchCreator();
  }, [creatorId]);

  const handleDelete = () => {
    deletePost(
      { postId: post.$id, imageId: post.imageId },
      {
        onSuccess: () => toast.success("Post deleted"),
        onError: () => toast.error("Delete failed"),
      }
    );
  };

  return (
    <div className="post-card">
      <div className="flex-between">
        <Link
          to={`/profile/${creatorId}`}
          className="flex items-center gap-3"
        >
          <img
            src={creatorData?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            className="w-12 h-12 rounded-full"
            alt="user"
          />
          <div>
            <p className="text-white">
              {creatorData?.name || "Unknown User"}
            </p>
            <p className="text-gray-400 text-sm">
              {multiFormatDateString(post.$createdAt)}
            </p>
          </div>
        </Link>

        {user?.$id === creatorId && (
          <button
            onClick={handleDelete}
            className="text-red-500"
          >
            Delete
          </button>
        )}
      </div>

      <p className="mt-3 text-white">{post.caption}</p>
      <img
        src={post.imageUrl}
        className="w-full rounded-xl mt-3"
        alt="post"
      />

      <div className="mt-4">
        <PostStats
          post={post}
          userId={user?.$id || ""}
        />
      </div>
    </div>
  );
};

export default PostCard;