import { Link } from "react-router-dom";
import { toast } from "sonner";

import type { IPost } from "@/Types";
import { useUserContext } from "@/Context/useAuthContext";
import { useDeletePost } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import PostStats from "@/components/shared/PostStats";

type PostCardProps = {
  post: IPost;
  savedRecordId?: string;
  onUnsave?: (postId: string) => void;
};

const PostCard = ({ post, savedRecordId, onUnsave }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();

  const creator =
    typeof post.creator === "object" && post.creator !== null
      ? post.creator
      : null;

  const creatorId = creator?.$id ?? (post.creator as string);

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
        <Link to={`/profile/${creatorId}`} className="flex items-center gap-3">
          <img
            src={creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            className="w-12 h-12 rounded-full"
            alt="user"
          />
          <div>
            <p className="text-white">{creator?.name || "Unknown User"}</p>
            <p className="text-gray-400 text-sm">
              {multiFormatDateString(post.$createdAt)}
            </p>
          </div>
        </Link>

        {user?.$id === creatorId && (
          <div className="flex gap-3">
            <Link to={`/update-post/${post.$id}`}>
              <img src="/assets/icons/edit.svg" alt="edit" className="w-5 h-5" />
            </Link>
            <button onClick={handleDelete}>
              <img src="/assets/icons/delete.svg" alt="delete" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-white">{post.caption}</p>

      <img
        src={String(post.imageUrl)}
        className="w-full rounded-xl mt-3 object-cover max-h-[400px]"
        alt="post"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "/assets/icons/profile-placeholder.svg";
        }}
      />

      <div className="mt-4">
        <PostStats
          post={post}
          userId={user?.$id || ""}
          savedRecordId={savedRecordId}
          onUnsave={onUnsave}
        />
      </div>
    </div>
  );
};

export default PostCard;