export type NotificationCategory = "ANNOUNCEMENT" | "LEARNING" | "LIVE" | "OFFER";

/** Where tapping a notification leads (§15.3). */
export type DeepLink = {
  type: "NONE" | "HOME" | "NOTIFICATIONS" | "LIBRARY" | "COURSE" | "LESSON" | "PRODUCT" | "LIVE_SESSION" | "URL";
  id: string | null;
  course_id: string | null;
  url: string | null;
};

export type InboxItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  image_url: string | null;
  deep_link: DeepLink;
  read: boolean;
  created_at: string;
};

export type InboxPage = { items: InboxItem[]; next_cursor: string | null; unread_count: number };
