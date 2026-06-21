import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import FileUploader from "../shared/FileUploader";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { useUserContext } from "@/Context/useAuthContext";
import type { IPost } from "@/Types";

const PostSchema = z.object({
  caption: z.string().min(5),
  file: z.custom<File[]>().optional(),
  location: z.string().min(1),
  tags: z.string(),
});

type PostFormProps = {
  post?: IPost;
  action: "Create" | "Update";
};

const DRAFT_KEY = "post_draft";

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const savedDraft =
    action === "Create"
      ? JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}")
      : {};

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      caption: post?.caption ?? savedDraft.caption ?? "",
      file: [],
      location: post?.location ?? savedDraft.location ?? "",
      tags: post ? post.tags.join(",") : savedDraft.tags ?? "",
    },
  });

  const watchedValues = watch(["caption", "location", "tags"]);

  useEffect(() => {
    if (action === "Create") {
      const [caption, location, tags] = watchedValues;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ caption, location, tags })
      );
    }
  }, [watchedValues, action]);

  const onSubmit = async (values: z.infer<typeof PostSchema>) => {
    const tagsArray = values.tags
      ? values.tags.split(",").map((tag) => tag.trim())
      : [];

    const files = values.file || [];

    // ✅ تأكد إن في صورة
    if (action === "Create" && files.length === 0) {
      toast.error("Please add a photo");
      return;
    }

    const basePayload = {
      caption: values.caption,
      location: values.location,
      file: files,
      tags: tagsArray,
      creatorId: user.$id,
    };

    try {
      if (action === "Update" && post) {
        const updatedPost = await updatePost({
          ...basePayload,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });
        if (updatedPost) {
          toast.success("Post updated!");
          navigate(`/posts/${post.$id}`);
        }
        return;
      }

      // ✅ toast للانتظار
      toast.loading("Uploading post...", { id: "create-post" });

      const newPost = await createPost(basePayload);

      if (newPost) {
        toast.success("Post created!", { id: "create-post" });
        localStorage.removeItem(DRAFT_KEY);
        navigate(`/posts/${newPost.$id}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed. Please check your connection and try again.", {
        id: "create-post",
      });
    }
  };

  const isLoading = isLoadingCreate || isLoadingUpdate;

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
            setValue("file", files, { shouldValidate: true })
          }
          mediaUrl={post?.imageUrl}
        />
        {errors.file && (
          <p className="text-red-500 text-sm">{errors.file.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white">Add Location</label>
        <input className="shad-input" {...register("location")} />
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

      {/* Draft restored */}
      {action === "Create" && savedDraft.caption && (
        <div className="flex justify-between items-center bg-dark-3 rounded-xl px-4 py-2">
          <p className="text-light-3 text-sm">Draft restored</p>
          <button
            type="button"
            className="text-red-400 text-sm hover:text-red-300 transition"
            onClick={() => {
              localStorage.removeItem(DRAFT_KEY);
              window.location.reload();
            }}
          >
            Clear draft
          </button>
        </div>
      )}

      <div className="flex gap-4 items-center justify-end">
        <button
          type="button"
          className="shad-button_dark_4"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="shad-button_primary whitespace-nowrap flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            `${action} Post`
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;