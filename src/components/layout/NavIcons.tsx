import { BookOpen, Briefcase, Store, Users, Video, type LucideIcon } from "lucide-react";
import type { NavIcon } from "@/config/nav";

const ICONS: Record<NavIcon, LucideIcon> = {
  community: Users,
  live: Video,
  courses: BookOpen,
  store: Store,
  masterclass: Briefcase,
};

export function NavIconSvg({ name, active }: { name: NavIcon; active?: boolean }) {
  const Icon = ICONS[name];
  return <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.8} />;
}
