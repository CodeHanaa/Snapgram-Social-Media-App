import { useUserContext } from "@/Context/useAuthContext";
import { useEffect, useState } from "react";

import { getSavedPosts } from "@/lib/Appwrite/Api";
import GridPostList from "@/components/shared/GridPostList ";
import type { SavedPost } from "@/Types";

const Saved = () => {
  const { user } = useUserContext();

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;

    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true);

        const response = await getSavedPosts(user.$id);

        console.log("SAVED RESPONSE:", response);

        // 🔥 أهم تعديل هنا: تأكد إن الشكل مطابق للـ type
        const formatted: SavedPost[] = response.map((item: any) => ({
          $id: item.$id,
          user: item.user ?? item.userId ?? "",
          post: item.post ?? null,
        }));

        setSavedPosts(formatted);
      } catch (error) {
        console.error(error);
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
        <img src="/assets/icons/save.svg" width={36} height={36} />
        <h2 className="h3-bold">Saved Posts</h2>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10">No saved posts yet</p>
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9 flex-wrap">
          {savedPosts
            .filter((save) => save.post)
            .map((save) => {
              const post = save.post;

              return (
                <li key={save.$id}>
                  <GridPostList posts={[post!]} />
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default Saved;