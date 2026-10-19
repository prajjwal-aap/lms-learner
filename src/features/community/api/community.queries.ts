"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "../types";
import { addPostComment, createPost, getHeroSlides, getPosts, getSidebar, togglePostLike } from "./community.api";

export const communityKeys = {
  sidebar: ["community", "sidebar"] as const,
  hero: ["community", "hero"] as const,
  posts: ["community", "posts"] as const,
};

export const useCommunitySidebar = () => useQuery({ queryKey: communityKeys.sidebar, queryFn: getSidebar });
export const useHeroSlides = () => useQuery({ queryKey: communityKeys.hero, queryFn: getHeroSlides });
export const usePosts = () => useQuery({ queryKey: communityKeys.posts, queryFn: getPosts });

/** Writes the server's copy of a post back into the cached feed. */
function useReplacePost() {
  const qc = useQueryClient();
  return (post: Post) => qc.setQueryData<Post[]>(communityKeys.posts, (old) => old?.map((p) => (p.id === post.id ? post : p)));
}

/** Like/unlike with an optimistic update. */
export function useToggleLike() {
  const qc = useQueryClient();
  const replace = useReplacePost();
  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async (postId: string) => {
      await qc.cancelQueries({ queryKey: communityKeys.posts });
      const prev = qc.getQueryData<Post[]>(communityKeys.posts);
      qc.setQueryData<Post[]>(communityKeys.posts, (old) =>
        old?.map((p) => (p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => ctx?.prev && qc.setQueryData(communityKeys.posts, ctx.prev),
    onSuccess: replace,
  });
}

export function useAddComment() {
  const replace = useReplacePost();
  return useMutation({ mutationFn: addPostComment, onSuccess: replace });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => qc.setQueryData<Post[]>(communityKeys.posts, (old) => [post, ...(old ?? [])]),
  });
}
