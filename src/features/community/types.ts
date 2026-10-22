import type { LucideIcon } from "lucide-react";

/** Top-level sidebar entries (Feed, Messages). */
export interface CommunityNavItem {
  id: string;
  label: string;
  /** Lucide icon component, e.g. Compass. */
  icon: LucideIcon;
  badge?: number;
}

/** A batch/sub-channel inside a group. */
export interface CommunityChannel {
  id: string;
  name: string;
  /** Lucide icon component + colour for the leading icon. */
  icon: LucideIcon;
  iconClassName: string;
  badge?: number;
}

/** Collapsible course group in the left sidebar. */
export interface CommunityGroup {
  id: string;
  name: string;
  hasUnread: boolean;
  channels: CommunityChannel[];
}

export interface CommunitySidebar {
  nav: CommunityNavItem[];
  groups: CommunityGroup[];
}

export interface HeroSlide {
  id: string;
  title: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  /** Where "Enroll Now" leads — a course page if owned, else the store. */
  href: string;
  imageUrl: string;
  imageAlt: string;
}

export interface PostAuthor {
  name: string;
  /** Omitted → brand "Om" avatar. */
  avatarUrl?: string;
}

export interface PostParagraph {
  text: string;
  strong?: boolean;
}

export interface PostComment {
  id: string;
  author: string;
  text: string;
  postedAgo: string;
}

export interface Post {
  id: string;
  pinned: boolean;
  author: PostAuthor;
  postedAgo: string;
  /** Used for sorting "Latest". */
  postedAt: string;
  /** Channel the post was published to (matches CommunityChannel.id). */
  channelId: string;
  channelName: string;
  /** "+450" chip: additional audiences the post reached. */
  extraAudience?: number;
  paragraphs: PostParagraph[];
  likes: number;
  likedByMe: boolean;
  views: number;
  comments: PostComment[];
  /** Written by the signed-in learner (shown on their profile). */
  byMe?: boolean;
}

export type FeedSort = "latest" | "most-liked" | "most-viewed";
