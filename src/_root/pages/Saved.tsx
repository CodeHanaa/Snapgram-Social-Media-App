import { useUserContext } from "@/Context/useAuthContext";
import { useEffect, useState } from "react";
import { getSavedPosts, getPostById } from "@/lib/Appwrite/Api";

import GridPostList from "@/components/shared/GridPostList ";
import type { IPost } from "@/Types";
import type { Models } from "appwrite";

interface ISaveDocument extends Models.Document {
  post: string;
  user: string;
}

const Saved = () => {
  const { user } = useUserContext();
  const [savedPosts, setSavedPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;

    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true);

        const response = await getSavedPosts(user.$id);

        if (!response) {
          setSavedPosts([]);
          return;
        }

        const posts = await Promise.all(
          response.map(async (save: Models.Document) => {
            const saveDoc = save as ISaveDocument;

            if (!saveDoc.post) return null;

            const postDoc = await getPostById(saveDoc.post);

            return postDoc;
          })
        );

        const validPosts = posts.filter(
          (post): post is IPost => post !== null
        );

        setSavedPosts(validPosts);
      } catch (error) {
        console.error("Saved posts error:", error);
        setSavedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user?.$id]);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="save"
        />
        <h2 className="h3-bold">Saved Posts</h2>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10">
          No saved posts yet
        </p>
      ) : (
        <GridPostList posts={savedPosts} />
      )}
    </div>
  );
};

export default Saved;