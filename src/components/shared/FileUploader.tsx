import { useCallback, useState } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone";

// أضفنا mediaUrl للـ props
type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string; 
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [file, setFile] = useState<File[]>([]);
  // قمنا بتهيئة fileUrl ليأخذ قيمة mediaUrl إذا كانت موجودة (في حالة التعديل)
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl || "");

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFile(acceptedFiles);
    fieldChange(acceptedFiles);
    setFileUrl(URL.createObjectURL(acceptedFiles[0]));
  }, [fieldChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpeg", ".jpg", ".svg"] },
  });

  return (
    <div {...getRootProps()} className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer overflow-hidden border-2 border-dashed border-dark-4">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        // في حال وجود صورة (سواء كانت جديدة أو موجودة مسبقاً)، نعرضها
        <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
          <img src={fileUrl} alt="uploaded" className="file_uploader-img" />
        </div>
      ) : (
        // في حال عدم وجود أي صورة، نظهر أيقونة الرفع
        <div className="file_uploader-box flex flex-col items-center justify-center p-10">
          <img src="/assets/icons/file-upload.svg" width={96} height={77} alt="file-upload" />
          <h3 className="base-medium text-light-2 mb-2 mt-6">Drag photo here</h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>
          <div className="shad-button_dark_4 cursor-pointer">Select from computer</div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;