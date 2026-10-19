/**
 * Stand-in for a real backend. Services await `mockDelay()` and read/write
 * in-memory arrays; swap each service body for `apiClient` calls later
 * without touching ViewModels or Views.
 */
export const mockDelay = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms));
