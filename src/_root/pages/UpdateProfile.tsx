import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUserContext } from "@/Context/useAuthContext";
import { appwriteService, appwriteConfig } from "@/lib/Appwrite/Config";
import { ID } from "appwrite";
import { toast } from "sonner";
import ProfileUploader from "@/components/shared/ProfileUploader"; // ✅ جديد
import Loader from "@/components/shared/Loader"; // ✅ جديد

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // ✅ الـ ProfileUploader هيتكلم معاه

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    try {
      let imageUrl = user.imageUrl;

      if (imageFile) {
        const uploadedFile = await appwriteService.storage.createFile(
          appwriteConfig.storageId,
          ID.unique(),
          imageFile
        );

        const fileUrl = appwriteService.storage.getFileView(
          appwriteConfig.storageId,
          uploadedFile.$id,
        );
        imageUrl = fileUrl.toString();
      }

      const updated = await appwriteService.databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        id,
        { name, username, bio, imageUrl }
      );

      setUser((prev) => ({
        ...prev,
        name: updated.name,
        username: updated.username,
        bio: updated.bio,
        imageUrl: updated.imageUrl,
      }));

      toast.success("Profile updated!");
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-lg mx-auto gap-8">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-light-2 hover:text-white transition"
          >
            <img src="/assets/icons/back.svg" alt="back" className="w-5 h-5" />
          </button>
          <img src="/assets/icons/edit.svg" alt="edit" className="w-8 h-8" />
          <h2 className="h3-bold md:h2-bold">Edit Profile</h2>
        </div>

        <ProfileUploader
          fieldChange={(file: File) => setImageFile(file)}
          mediaUrl={user.imageUrl}
        />

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-dark-3 text-white rounded-xl px-4 py-3 text-sm outline-none border border-dark-4 focus:border-purple-500 transition"
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-dark-3 text-white rounded-xl px-4 py-3 text-sm outline-none border border-dark-4 focus:border-purple-500 transition"
              placeholder="Your username"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-dark-3 text-white rounded-xl px-4 py-3 text-sm outline-none border border-dark-4 focus:border-purple-500 transition resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-dark-4 text-light-2 hover:bg-dark-3 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition text-sm font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;