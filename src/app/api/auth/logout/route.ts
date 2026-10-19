import { clearSession } from "@/server/session";

/** There is no logout API; dropping the tokens is the logout (§2). */
export async function POST() {
  await clearSession();
  return Response.json({ success: true, data: {} });
}
