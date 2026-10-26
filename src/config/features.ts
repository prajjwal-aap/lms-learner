/**
 * Features that can run on local mock data instead of the API, e.g. while a backend
 * module is down or not built yet. Set NEXT_PUBLIC_MOCK_FEATURES to a comma list
 * ("courses,live-sessions") or "all".
 */
export type MockableFeature = "auth" | "onboarding" | "account" | "courses" | "live-sessions" | "store" | "masterclasses" | "notifications";

const mocked = new Set(
  (process.env.NEXT_PUBLIC_MOCK_FEATURES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

export const isMocked = (feature: MockableFeature) => mocked.has("all") || mocked.has(feature);
