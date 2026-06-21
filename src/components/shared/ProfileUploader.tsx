import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type ProfileUploaderProps = {
  fieldChange: (file: File) => void;
  mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      fieldChange(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className="cursor-pointer flex items-center gap-4">
      <input {...getInputProps()} />
      <div className="relative">
        <img
          src={previewUrl || "/assets/icons/profile-placeholder.svg"}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover border-2 border-dark-4"
        />
        <div className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 rounded-full p-1.5">
          <span className="text-white text-xs">📷</span>
        </div>
      </div>
      <p className="text-purple-400 hover:text-purple-300 text-sm transition">
        Change Profile Photo
      </p>
    </div>
  );
};

export default ProfileUploader;