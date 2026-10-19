import { CLIENT_INFO, errorResponse, gatewayFetch, readEnvelope, relay } from "@/server/gateway";
import { getOrCreateDeviceId, saveTokens } from "@/server/session";

type VerifyData = {
  user: { id: string; name: string; avatar: string | null; ftu: boolean };
  accessToken: string;
  refreshToken: string;
  deletionScheduled?: { scheduledAt: string; daysRemaining: number };
};

/** POST { phoneNumber, otp } → gateway POST /auth/otp/verify (§2.2). Tokens go into httpOnly cookies, never to the browser. */
export async function POST(request: Request) {
  const { phoneNumber, otp } = (await request.json().catch(() => ({}))) as { phoneNumber?: string; otp?: string };
  if (!phoneNumber || !otp) return errorResponse(400, "Enter the OTP sent to your mobile", "VALIDATION_ERROR");

  const res = await gatewayFetch("/auth/otp/verify", {
    method: "POST",
    json: { phoneNumber, otp, deviceId: await getOrCreateDeviceId(), ...CLIENT_INFO },
  });
  if (!res.ok) return relay(res);

  const body = await readEnvelope<VerifyData>(res);
  if (!body?.success) return errorResponse(502, "Login failed. Please try again.");

  const { user, accessToken, refreshToken, deletionScheduled } = body.data;
  await saveTokens({ accessToken, refreshToken });
  return Response.json({ success: true, data: { user, deletionScheduled: deletionScheduled ?? null } });
}
