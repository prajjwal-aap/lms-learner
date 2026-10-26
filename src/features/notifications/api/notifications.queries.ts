"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationCategory } from "../types";
import { getUnreadCount, listNotifications, markAllRead, markRead } from "./notifications.api";

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  list: (category?: NotificationCategory) => ["notifications", "list", category ?? "ALL"] as const,
};

/** Bell badge. Polled so new campaigns show up without a reload; also refetched when the tab regains focus. */
export const useUnreadCount = () => useQuery({ queryKey: notificationKeys.unread, queryFn: getUnreadCount, refetchInterval: 60_000 });

export function useNotifications(category: NotificationCategory | undefined, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(category),
    queryFn: ({ pageParam }) => listNotifications(category, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    enabled,
  });
}

/** Both calls answer the new unread count: set the badge from it, then refresh the lists' read dots. */
function useInboxMutation<V>(fn: (vars: V) => Promise<number>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (count) => {
      qc.setQueryData(notificationKeys.unread, count);
      qc.invalidateQueries({ queryKey: ["notifications", "list"] });
    },
  });
}

export const useMarkRead = () => useInboxMutation(markRead);
export const useMarkAllRead = () => useInboxMutation(markAllRead);
