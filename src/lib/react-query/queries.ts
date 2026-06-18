import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { INewPost, IUpdatePost } from "@/Types";

import {
  getRecentPosts,
  createPost,
  deletePost,
  getPostById,
  updatePost,
  likePost,
} from "@/lib/Appwrite/Api";

/* ================= POSTS ================= */

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getRecentPosts,
  });
};

/* ================= CREATE ================= */

export const useCreatePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

/* ================= DELETE ================= */

export const useDeletePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

/* ================= GET BY ID ================= */

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

/* ================= UPDATE ================= */

export const useUpdatePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["post", variables.postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

/* ================= LIKE ================= */

export const useLikePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["post", variables.postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};