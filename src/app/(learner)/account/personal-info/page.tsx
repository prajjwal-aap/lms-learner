import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

// Personal information moved into the profile page; keep old links working.
export default function PersonalInfoPage() {
  redirect(ROUTES.account.personalInfo);
}
