import { ROUTES } from "./routes";

export type NavIcon = "community" | "live" | "courses" | "store" | "masterclass";

export const LEARNER_NAV: { label: string; href: string; icon: NavIcon }[] = [
  { label: "Community", href: ROUTES.community, icon: "community" },
  { label: "Live Sessions", href: ROUTES.liveSessions, icon: "live" },
  { label: "My Learnings", href: ROUTES.courses, icon: "courses" },
  { label: "Courses", href: ROUTES.store, icon: "store" },
  { label: "Masterclass", href: ROUTES.masterclasses, icon: "masterclass" },
];
