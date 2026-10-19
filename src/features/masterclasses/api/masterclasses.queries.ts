"use client";

import { useQuery } from "@tanstack/react-query";
import { useProducts, type CatalogProduct } from "@/features/catalog";
import { getMasterclassPageContent } from "./masterclasses.api";

export const masterclassKeys = {
  content: ["masterclasses", "content"] as const,
};

export function useMasterclassPageContent() {
  return useQuery({ queryKey: masterclassKeys.content, queryFn: getMasterclassPageContent });
}

const byNextSlot = (a: CatalogProduct, b: CatalogProduct) =>
  (a.next_session_at ? Date.parse(a.next_session_at) : Infinity) - (b.next_session_at ? Date.parse(b.next_session_at) : Infinity);

/** Masterclasses + webinars from the catalog, soonest slot first (the API takes one type per call). */
export function useLiveProducts() {
  const masterclasses = useProducts({ type: "MASTERCLASS", sort: "popular" }, 50);
  const webinars = useProducts({ type: "WEBINAR", sort: "popular" }, 50);
  const items = [...(masterclasses.data?.pages[0]?.items ?? []), ...(webinars.data?.pages[0]?.items ?? [])].sort(byNextSlot);
  return {
    items,
    isLoading: masterclasses.isLoading || webinars.isLoading,
    isError: masterclasses.isError && webinars.isError,
  };
}
