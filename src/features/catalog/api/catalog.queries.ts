"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ProductFilters } from "../types";
import { getCategories, getMentor, getProductPage, getRecommendations, listProducts } from "./catalog.api";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  products: (filters: ProductFilters, limit: number) => ["catalog", "products", filters, limit] as const,
  product: (slug: string) => ["catalog", "product", slug] as const,
  recommendations: (productId: string) => ["catalog", "recommendations", productId] as const,
  mentor: (slug: string) => ["catalog", "mentor", slug] as const,
};

// Catalog responses are cached for 60 s server-side (§5), so match that on the client.
const STALE = 60_000;

export const useCategories = () => useQuery({ queryKey: catalogKeys.categories, queryFn: getCategories, staleTime: 5 * STALE });

/** Product grid with "Load more" (cursor pagination). The previous results stay visible while filters change. */
export function useProducts(filters: ProductFilters, limit = 12) {
  return useInfiniteQuery({
    queryKey: catalogKeys.products(filters, limit),
    queryFn: ({ pageParam }) => listProducts(filters, pageParam, limit),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}

export const useProductPage = (slug: string) =>
  useQuery({ queryKey: catalogKeys.product(slug), queryFn: () => getProductPage(slug), staleTime: STALE });

export const useRecommendations = (productId: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.recommendations(productId ?? ""),
    queryFn: () => getRecommendations(productId!),
    enabled: !!productId,
    staleTime: STALE,
  });

export const useMentor = (slug: string | null) =>
  useQuery({ queryKey: catalogKeys.mentor(slug ?? ""), queryFn: () => getMentor(slug!), enabled: !!slug, staleTime: STALE });
