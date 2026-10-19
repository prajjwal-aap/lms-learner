/** Live sessions contract (OG_APP_API_REFERENCE §10). */

export type SessionTab = "upcoming" | "past";

export type RegistrationStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED";
export type SessionStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

/** One registration from GET /live/v1/me/sessions. */
export type LiveRegistration = {
  registration_no: string;
  status: RegistrationStatus;
  attendee: { name: string; is_self: boolean };
  session: {
    id: string;
    title: string;
    scheduled_at: string;
    duration_min: number;
    timezone: string;
    status: SessionStatus;
    product: { slug: string; title: string; type: "WEBINAR" | "MASTERCLASS" | string; thumbnail_url: string | null };
    mentors: { slug: string; display_name: string }[];
  };
  /** Join window: 30 min before start until 3 h after. */
  join: { opens_at: string; closes_at: string; can_join_now: boolean };
  replay: { status: "NONE" | "PROCESSING" | "READY" };
};

export type SessionPage = { items: LiveRegistration[]; next_cursor: string | null };
