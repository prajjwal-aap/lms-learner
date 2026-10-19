import { CLIENT_INFO, errorResponse, gatewayFetch, relay } from "@/server/gateway";

/** POST { phoneNumber } → gateway POST /auth/otp (§2.1). */
export async function POST(request: Request) {
  const { phoneNumber } = (await request.json().catch(() => ({}))) as { phoneNumber?: string };
  if (!phoneNumber) return errorResponse(400, "Enter a valid 10-digit mobile number", "VALIDATION_ERROR");

  const res = await gatewayFetch("/auth/otp", {
    method: "POST",
    json: { phoneNumber, appVersion: CLIENT_INFO.appVersion, deviceType: CLIENT_INFO.deviceType, country_Code: 91 },
  });
  return relay(res);
}
