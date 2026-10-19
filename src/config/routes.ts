export const ROUTES = {
  login: "/login",
  resetPassword: "/reset-password",
  onboarding: {
    profile: "/onboarding/profile",
    goal: "/onboarding/goal",
    topics: "/onboarding/topics",
  },
  community: "/community",
  liveSessions: "/live-sessions",
  courses: "/courses",
  course: (courseId: string) => `/courses/${courseId}`,
  lesson: (courseId: string, lessonId: string) => `/courses/${courseId}/learn/${lessonId}`,
  ebook: (publicationId: string) => `/ebooks/${publicationId}`,
  store: "/store",
  product: (slug: string) => `/store/${slug}`,
  account: {
    home: "/account",
    profile: "/account/profile",
    personalInfo: "/account/personal-info",
    contact: "/account/contact",
    purchases: "/account/purchases",
    order: (orderId: string) => `/account/purchases/${orderId}`,
  },
  masterclasses: "/masterclasses",
} as const;

/** `?next=` targets must stay on this site (blocks `//evil.com` open redirects). */
export const safeNextPath = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);
