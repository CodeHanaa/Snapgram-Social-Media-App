import type {IPost} from "@/Types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getRecentPosts, 
  createPost, 
  deletePost, 
  getPostById,  // تأكدي من إضافتها هنا
  updatePost
} from "@/lib/Appwrite/Api"; 
import { appwriteConfig } from "@/lib/Appwrite/Config"; // تأكدي من المسار الصحيح

// 1. جلب البوستات الحديثة
export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: ['getRecentPosts'],
    queryFn: getRecentPosts,
  });
};

// 2. إنشاء بوست جديد
export const useCreatePost = () => {
  return useMutation({
    mutationFn: (post: any) => createPost(post),
  });
};

// 3. حذف بوست
export const useDeletePost = () => {
  const queryClient = useQueryClient();
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

// 4. جلب بوست معين بواسطة الـ ID (لصفحة التعديل)
export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [appwriteConfig.postCollectionId, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  }) as { data: IPost | undefined; isPending: boolean }; // <--- أضيفي هذا السطر
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (post: any) => updatePost(post),
    onSuccess: (data) => {
      // استخدمي النص "getPostById" أو أي مفتاح تستخدمينه لجلب البوست الواحد
      queryClient.invalidateQueries({
        queryKey: ["getPostById", data?.$id],
      });
      
      // استخدمي النص "getRecentPosts" (أو أي مفتاح تستخدمينه لجلب البوستات في الـ Home)
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"],
      });
    },
  });
};