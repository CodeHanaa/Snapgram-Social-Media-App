import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"; // تأكدي من تثبيت sonner أو استخدمي مكتبة التنبيهات الخاصة بكِ
import FileUploader from "../shared/FileUploader";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import type { IPost } from "@/Types";

// Schema محدثة لتكون الـ file اختيارية في التعديل
const PostSchema = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }),
  file: z.custom<File[]>().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  tags: z.string(),
});

type PostFormProps = {
  post?: IPost;
  action: 'Create' | 'Update';
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  
  // Hooks
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

const onSubmit = async (values: z.infer<typeof PostSchema>) => {
    console.log("Submit clicked! Action:", action); // 1. التأكد أن الزر يعمل
    
    // 2. إذا كان تعديل
    if (action === 'Update' && post) {
      console.log("Starting Update with values:", values);
      
      try {
        const updatedPost = await updatePost({
          ...values,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });
        
        console.log("Update success:", updatedPost);
        if (updatedPost) {
          navigate(`/posts/${post.$id}`);
        }
      } catch (error) {
        console.error("Critical Error during update:", error); // 3. هل يظهر خطأ هنا؟
      }
      return;
    }

    // 3. إذا كان إنشاء
    console.log("Starting Create...");
    try {
      const newPost = await createPost({
        ...values,
        userId: user.$id,
      });
      if (newPost) navigate("/");
    } catch (error) {
      console.error("Critical Error during create:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <label className="text-white">Caption</label>
        <textarea className="shad-textarea custom-scrollbar" {...register("caption")} />
        {errors.caption && <p className="text-red-500 text-sm">{errors.caption.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Photos</label>
        <FileUploader fieldChange={(files: File[]) => setValue("file", files)} mediaUrl={post?.imageUrl} />
        {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Location</label>
        <input className="shad-input" {...register("location")} />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Tags (separated by comma)</label>
        <input className="shad-input" placeholder="Art, Expression, Learn" {...register("tags")} />
      </div>

      <div className="flex gap-4 items-center justify-end">
        <button type="button" className="shad-button_dark_4" onClick={() => navigate(-1)}>Cancel</button>
        <button 
          type="submit" 
          disabled={isLoadingCreate || isLoadingUpdate} 
          className="shad-button_primary whitespace-nowrap"
        >
          {isLoadingCreate || isLoadingUpdate ? "Loading..." : `${action} Post`}
        </button>
      </div>
    </form>
  );
};

export default PostForm;