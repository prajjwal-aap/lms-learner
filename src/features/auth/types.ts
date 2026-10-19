/** The signed-in user (login response / GET /users). */
export type Learner = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type DeletionSchedule = { scheduledAt: string; daysRemaining: number };

export type SignInResult = {
  learner: Learner;
  /** First login ever (`ftu`): send the learner through onboarding. */
  isFirstLogin: boolean;
  /** Present when the account is scheduled for deletion (§2.2). */
  deletionScheduled: DeletionSchedule | null;
};

export type SendOtpInput = { phone: string };
export type VerifyOtpInput = SendOtpInput & { otp: string };

/** Server OTPs are 4 digits (§2.1). */
export const OTP_LENGTH = 4;
