import { isMocked } from "@/config/features";
import { api, authRequest, isApiError } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import { session } from "../session";
import type { Learner, SendOtpInput, SignInResult, VerifyOtpInput } from "../types";
import { DEMO_OTP, MOCK_LEARNER } from "./auth.mock";

/** 10 digits, no country code, first digit 1–9 (§2.1). */
const PHONE_PATTERN = /^[1-9]\d{9}$/;

type UserDto = { id: string; name: string; avatar: string | null; ftu?: boolean };
type OtpStatusDto = { resendAfterSeconds?: number; nextResendTime?: number };

const toLearner = (u: UserDto): Learner => ({ id: u.id, name: u.name, avatarUrl: u.avatar });

/** Seconds until the next resend is allowed; `nextResendTime` is epoch ms. */
const resendWait = (s?: OtpStatusDto) =>
  s?.nextResendTime ? Math.max(0, Math.ceil((s.nextResendTime - Date.now()) / 1000)) : (s?.resendAfterSeconds ?? 30);

/** Cool-down carried by a 429 / wrong-OTP error, so the resend timer can follow the server. */
export function otpCooldownFromError(error: unknown): number | null {
  if (!isApiError(error)) return null;
  const status = (error.data as { otpStatus?: OtpStatusDto } | undefined)?.otpStatus;
  return status ? resendWait(status) : null;
}

export async function sendOtp({ phone }: SendOtpInput): Promise<{ resendInSeconds: number }> {
  if (!PHONE_PATTERN.test(phone)) throw new Error("Enter a valid 10-digit mobile number");
  if (isMocked("auth")) {
    await mockDelay(400);
    return { resendInSeconds: 30 };
  }
  const data = await authRequest<{ otpStatus: OtpStatusDto }>("otp", { phoneNumber: phone });
  return { resendInSeconds: resendWait(data.otpStatus) };
}

export async function verifyOtp({ phone, otp }: VerifyOtpInput): Promise<SignInResult> {
  if (isMocked("auth")) {
    await mockDelay(400);
    if (otp !== DEMO_OTP) throw new Error(`Invalid code. Use the demo OTP ${DEMO_OTP}`);
    session.startMock();
    return { learner: MOCK_LEARNER, isFirstLogin: !session.isOnboarded(), deletionScheduled: null };
  }
  const data = await authRequest<{ user: UserDto; deletionScheduled: SignInResult["deletionScheduled"] }>("verify", {
    phoneNumber: phone,
    otp,
  });
  return { learner: toLearner(data.user), isFirstLogin: !!data.user.ftu, deletionScheduled: data.deletionScheduled };
}

export async function logout() {
  if (isMocked("auth")) return session.endMock();
  await authRequest("logout");
}

export async function getCurrentLearner(): Promise<Learner> {
  if (isMocked("auth")) {
    await mockDelay();
    return MOCK_LEARNER;
  }
  const data = await api.get<{ user: UserDto }>("/users");
  return toLearner(data.user);
}
