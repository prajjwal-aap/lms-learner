import type { Learner } from "../types";

export const MOCK_LEARNER: Learner = {
  id: "l1",
  name: "Aarav Sharma",
  avatarUrl: null,
};

/** OTP accepted when auth runs on mock data (NEXT_PUBLIC_MOCK_FEATURES includes "auth"). */
export const DEMO_OTP = "1234";
