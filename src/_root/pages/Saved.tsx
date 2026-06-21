import { useUserContext } from "@/Context/useAuthContext";
import { useEffect, useState } from "react";
import { getSavedPosts, getPostById } from "@/lib/Appwrite/Api";
import PostCard from "@/components/shared/PostCard";
import type { IPost } from "@/Types";
import type { Models } from "appwrite";

interface ISaveDocument extends Models.Document {
  post: string;
  user: string;
}

type SavedPostWithRecord = {
  post: IPost;
  savedRecordId: string;
};

const Saved = () => {
  const { user } = useUserContext();
  const [savedPosts, setSavedPosts] = useState<SavedPostWithRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;

    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getSavedPosts(user.$id);
        if (!response) { setSavedPosts([]); return; }

        const results = await Promise.all(
          response.map(async (save: Models.Document) => {
            const saveDoc = save as ISaveDocument;
            if (!saveDoc.post) return null;
            const post = await getPostById(saveDoc.post);
            if (!post) return null;
            return { post, savedRecordId: saveDoc.$id };
          })
        );

        setSavedPosts(
          results.filter((r): r is SavedPostWithRecord => r !== null)
        );
      } catch (error) {
        console.error("Saved posts error:", error);
        setSavedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user?.$id]);

//  Remove post from the list immediately when the user unsaves it
  const handleUnsave = (postId: string) => {
    setSavedPosts((prev) => prev.filter((item) => item.post.$id !== postId));
  };

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-screen-sm mx-auto gap-9">
        <div className="flex gap-2 items-center">
          <img src="/assets/icons/save.svg" width={36} height={36} alt="save" />
          <h2 className="h3-bold">Saved Posts</h2>
        </div>

        {savedPosts.length === 0 ? (
          <p className="text-light-4 mt-10 text-center">No saved posts yet</p>
        ) : (
          <ul className="flex flex-col gap-9 w-full">
            {savedPosts.map(({ post, savedRecordId }) => (
              <li key={post.$id}>
                <PostCard
                  post={post}
                  savedRecordId={savedRecordId}
                  onUnsave={handleUnsave}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Saved;