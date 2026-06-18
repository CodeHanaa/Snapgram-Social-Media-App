import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FileUploader from "../shared/FileUploader";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import type { IPost } from "@/Types";

const PostSchema = z.object({
  caption: z.string().min(5),
  file: z.custom<File[]>().optional(),
  location: z.string().min(1),
  tags: z.string(), // خليها string في الفورم فقط
});

type PostFormProps = {
  post?: IPost;
  action: 'Create' | 'Update';
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof PostSchema>) => {
  const tagsArray = values.tags
    ? values.tags.split(",").map((tag) => tag.trim())
    : [];

  const files = values.file || [];

  const basePayload = {
    caption: values.caption,
    location: values.location,
    file: files,
    tags: tagsArray, // 👈 هنا المهم
    creatorId: user.$id,
  };

  if (action === "Update" && post) {
    const updatedPost = await updatePost({
      ...basePayload,
      postId: post.$id,
      imageId: post.imageId,
      imageUrl: post.imageUrl,
    });

    if (updatedPost) navigate(`/posts/${post.$id}`);
    return;
  }

  const newPost = await createPost(basePayload);

  if (newPost) {
    navigate(`/posts/${newPost.$id}`);
  }
};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-9 w-full max-w-5xl"
    >
      <div className="flex flex-col gap-2">
        <label className="text-white">Caption</label>
        <textarea
          className="shad-textarea custom-scrollbar"
          {...register("caption")}
        />
        {errors.caption && (
          <p className="text-red-500 text-sm">{errors.caption.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Photos</label>
        <FileUploader
          fieldChange={(files: File[]) =>
            setValue("file", files, {
              shouldValidate: true,
            })
          }
          mediaUrl={post?.imageUrl}
        />
        {errors.file && (
          <p className="text-red-500 text-sm">{errors.file.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Location</label>
        <input
          className="shad-input"
          {...register("location")}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Tags (separated by comma)</label>
        <input
          className="shad-input"
          placeholder="Art, Expression, Learn"
          {...register("tags")}
        />
      </div>

      <div className="flex gap-4 items-center justify-end">
        <button
          type="button"
          className="shad-button_dark_4"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoadingCreate || isLoadingUpdate}
          className="shad-button_primary whitespace-nowrap"
        >
          {isLoadingCreate || isLoadingUpdate
            ? "Loading..."
            : `${action} Post`}
        </button>
      </div>
    </form>
  );
};

export default PostForm;