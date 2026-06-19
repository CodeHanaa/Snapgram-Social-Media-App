import { useUserContext } from "@/Context/useAuthContext";
import { useEffect, useState } from "react";

import { getSavedPosts, getPostById } from "@/lib/Appwrite/Api";
import GridPostList from "@/components/shared/GridPostList ";
import type { IPost } from "@/Types";

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
          setIsLoading(false);
          return;
        }

        const posts = await Promise.all(
          response.map(async (save: any) => {
            if (!save.post) return null;

            const postDoc = await getPostById(save.post);
            
            // تحويل النتيجة إلى IPost لضمان تطابق النوع
            return postDoc as IPost;
          })
        );

        // فلترة العناصر الفارغة والتأكد من أنها تتبع نوع IPost
        const validPosts = posts.filter((post): post is IPost => post !== null);
        
        setSavedPosts(validPosts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
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
        <img src="/assets/icons/save.svg" width={36} height={36} alt="save" />
        <h2 className="h3-bold">Saved Posts</h2>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10">No saved posts yet</p>
      ) : (
        <GridPostList posts={savedPosts} />
      )}
    </div>
  );
};

export default Saved;