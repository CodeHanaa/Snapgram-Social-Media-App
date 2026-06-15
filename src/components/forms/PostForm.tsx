import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FileUploader from "../shared/FileUploader";
import { useCreatePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";

const PostSchema = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }),
  file: z.custom<File[]>().refine((files) => files.length > 0, { message: "Image is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  tags: z.string(),
});

const PostForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { user } = useUserContext();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: { caption: "", file: [], location: "", tags: "" },
  });

  const onSubmit = async (values: z.infer<typeof PostSchema>) => {
    // التعديل هنا: نستخدم user.$id بدلاً من user.id
    // لأن الـ Relationship يحتاج الـ Document ID الموجود في جدول users
    const postData = {
      userId: user.$id, 
      caption: values.caption,
      file: values.file,
      location: values.location,
      tags: values.tags ? values.tags.replace(/ /g, "").split(",") : [],
    };

    try {
      const newPost = await createPost(postData);
      if (newPost) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
      {/* Caption */}
      <div className="flex flex-col gap-2">
        <label className="text-white">Caption</label>
        <textarea className="shad-textarea custom-scrollbar" {...register("caption")} />
        {errors.caption && <p className="text-red-500 text-sm">{errors.caption.message}</p>}
      </div>

      {/* File Uploader */}
      <div className="flex flex-col gap-2">
        <label className="text-white">Add Photos</label>
        <FileUploader fieldChange={(files: File[]) => setValue("file", files)} />
        {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-white">Add Location</label>
        <input className="shad-input" {...register("location")} />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-white">Add Tags (separated by comma " , ")</label>
        <input className="shad-input" placeholder="Art, Expression, Learn" {...register("tags")} />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 items-center justify-end">
        <button type="button" className="shad-button_dark_4" onClick={() => navigate(-1)}>Cancel</button>
        <button type="submit" disabled={isLoadingCreate} className="shad-button_primary whitespace-nowrap">
          {isLoadingCreate ? "Loading..." : "Create Post"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;