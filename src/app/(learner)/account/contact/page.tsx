import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

// Phone & email moved into the profile page; keep old links working.
export default function ContactPage() {
  redirect(ROUTES.account.contact);
}
