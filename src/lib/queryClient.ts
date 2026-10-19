import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api";

/** 4xx answers won't change on retry; network / 5xx errors get two more tries with back-off. */
const shouldRetry = (failureCount: number, error: unknown) => !(isApiError(error) && error.status < 500) && failureCount < 2;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
