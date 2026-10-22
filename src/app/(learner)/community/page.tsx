import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
// import { CommunityScreen } from "@/features/community";

// Community is hidden until it has data; the route sends learners home instead.
// To restore: uncomment the import/metadata/page and remove the redirect version.

// export const metadata = { title: "Community" };

// export default function CommunityPage() {
//   return <CommunityScreen />;
// }

export default function CommunityPage() {
  redirect(ROUTES.home);
}
