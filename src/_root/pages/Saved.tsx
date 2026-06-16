import { useEffect, useState } from "react";
import { useUserContext } from "@/Context/useAuthContext";
import { getSavedPosts } from "@/lib/Appwrite/Api";
import PostCard from "@/components/shared/PostCard"; // لاستخدام الـ Card الخاص بكِ

const Saved = () => {
  const { user } = useUserContext();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  useEffect(() => {
    // تأكدي من وجود الـ ID قبل الاستدعاء
    if (user && user.$id) {
      const fetchSaved = async () => {
        const data = await getSavedPosts(user.$id);
        if (data) setSavedPosts(data.map((item: any) => item.post));
      };
      fetchSaved();
    }
  }, [user]); // استدعيها عندما يتغير الـ user بالكامل

  return (
    <div className="saved-container">
      <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      <ul className="w-full flex justify-center max-w-5xl gap-9">
        {savedPosts.length === 0 ? (
          <p className="text-light-4">No saved posts yet.</p>
        ) : (
          savedPosts.map((post) => (
            <li key={post.$id} className="w-full">
              <PostCard post={post} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Saved;