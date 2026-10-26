"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeLesson,
  enrollFree,
  getContinueLearning,
  getCourseHome,
  getLessonDetail,
  listLibrary,
  listPurchasedContent,
  openEbook,
  openPurchasedEbook,
  type LibraryQuery,
} from "./learning.api";
import type { LibraryCard } from "../types";

/** Everything under ["learning"] is invalidated after a purchase (see the checkout dialog). */
export const learningKeys = {
  all: ["learning"] as const,
  library: (q: LibraryQuery) => ["learning", "library", q] as const,
  continue: ["learning", "continue"] as const,
  purchases: ["learning", "purchases"] as const,
  course: (courseId: string) => ["learning", "course", courseId] as const,
  lesson: (courseId: string, lessonId: string) => ["learning", "lesson", courseId, lessonId] as const,
  ebook: (publicationId: string) => ["learning", "ebook", publicationId] as const,
  purchasedEbook: (orderId: string, productId: string) => ["learning", "ebook", "order", orderId, productId] as const,
};

export function useLibrary(query: LibraryQuery) {
  return useInfiniteQuery({
    queryKey: learningKeys.library(query),
    queryFn: ({ pageParam }) => listLibrary(query, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

export const useContinueLearning = () => useQuery({ queryKey: learningKeys.continue, queryFn: getContinueLearning });

/** Content bought through orders (pre-LMS purchases aren't in the library yet). */
export const usePurchasedContent = () => useQuery({ queryKey: learningKeys.purchases, queryFn: listPurchasedContent, staleTime: 60_000 });

/** Slugs of products the learner already owns (library + paid orders) — for "Purchased" / "Go to course" on product pages. */
export function useOwnedSlugs() {
  const library = useQuery({
    queryKey: learningKeys.library({}),
    queryFn: () => listLibrary({}, undefined, 50),
    staleTime: 60_000,
  });
  const purchases = usePurchasedContent();
  const owned = new Map<string, LibraryCard>();
  for (const c of [...(purchases.data ?? []), ...(library.data?.items ?? [])]) if (c.product_slug) owned.set(c.product_slug, c);
  return { data: owned, isLoading: library.isLoading || purchases.isLoading };
}

/** 4xx (no access, expired, locked, not found) won't fix themselves — don't retry them. */
const noClientRetry = (count: number, error: Error & { status?: number }) => (error.status ?? 500) >= 500 && count < 2;

export const useCourseHome = (courseId: string) =>
  useQuery({ queryKey: learningKeys.course(courseId), queryFn: () => getCourseHome(courseId), retry: noClientRetry });

export const useLessonDetail = (courseId: string, lessonId: string) =>
  useQuery({ queryKey: learningKeys.lesson(courseId, lessonId), queryFn: () => getLessonDetail(courseId, lessonId), retry: noClientRetry });

/** Opening an ebook issues a fresh signed URL; never reuse a cached one. */
export const useEbook = (publicationId: string) =>
  useQuery({ queryKey: learningKeys.ebook(publicationId), queryFn: () => openEbook(publicationId), retry: noClientRetry, staleTime: 0, gcTime: 0 });

export const usePurchasedEbook = (orderId: string, productId: string) =>
  useQuery({
    queryKey: learningKeys.purchasedEbook(orderId, productId),
    queryFn: () => openPurchasedEbook(orderId, productId),
    retry: noClientRetry,
    staleTime: 0,
    gcTime: 0,
  });

/** Ticks / progress come from the server, so refetch the course home after completing. */
export function useCompleteLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => completeLesson(courseId, lessonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: learningKeys.all }),
  });
}

export function useEnrollFree() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: enrollFree, onSuccess: () => qc.invalidateQueries({ queryKey: learningKeys.all }) });
}
