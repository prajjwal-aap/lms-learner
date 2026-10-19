"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionTab } from "../types";
import { listMySessions, registerFree } from "./live-sessions.api";

/** Everything under ["live"] is invalidated after a purchase (see the checkout dialog). */
export const liveSessionKeys = {
  all: ["live"] as const,
  list: (tab: SessionTab) => ["live", "sessions", tab] as const,
};

export function useMySessions(tab: SessionTab) {
  return useInfiniteQuery({
    queryKey: liveSessionKeys.list(tab),
    queryFn: ({ pageParam }) => listMySessions(tab, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    placeholderData: keepPreviousData,
    // Keeps "can_join_now" fresh while the page is open.
    refetchInterval: 60_000,
  });
}

/** Next few upcoming registrations, for widgets such as the community feed. */
export function useUpcomingSessions(limit = 3) {
  return useQuery({
    queryKey: [...liveSessionKeys.list("upcoming"), "widget"],
    queryFn: () => listMySessions("upcoming", undefined, limit),
    select: (page) => page.items.filter((r) => r.status !== "CANCELLED").slice(0, limit),
  });
}

export function useRegisterFree() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: registerFree, onSuccess: () => qc.invalidateQueries({ queryKey: liveSessionKeys.all }) });
}
