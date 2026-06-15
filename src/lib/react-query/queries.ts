import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecentPosts, createPost, deletePost } from "@/lib/Appwrite/Api"; 

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: ['getRecentPosts'],
    queryFn: getRecentPosts,
  });
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: (post: any) => createPost(post),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient(); // الآن ستعمل لأننا استوردناها
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"],
      });
    },
  });
};