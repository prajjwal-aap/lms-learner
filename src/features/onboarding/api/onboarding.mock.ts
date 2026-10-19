import type { GoalId, GoalOption, Topic } from "../types";

export const MOCK_GOALS: GoalOption[] = [
  {
    id: "self",
    title: "Understand myself and my life path",
    tag: "Atma Gyan",
    tagTone: "primary",
    description: "Decode personal horoscope, destiny cycles (Dasha), core strengths, and Karmic lessons with ancient Jyotish charts.",
    icon: "self_improvement",
  },
  {
    id: "guidance",
    title: "Get guidance on relationship & career",
    tag: "Muhurta & Yoga",
    tagTone: "secondary",
    description: "Navigate career transitions, marriage compatibility (Kundali Milan), and auspicious business timing.",
    icon: "explore",
  },
  {
    id: "hobby",
    title: "Learn it as a hobby or skill",
    tag: "Vidya Samvardhan",
    tagTone: "secondary",
    description: "Explore ancient occult sciences, celestial planetary movements, and sacred numerology for personal curiosity.",
    icon: "magic_button",
  },
  {
    id: "professional",
    title: "Become professional astrologer",
    tag: "Jyotish Acharya",
    tagTone: "primary",
    description: "Build a certified consulting practice, master client consultations, and guide seekers worldwide.",
    icon: "workspace_premium",
  },
];

export const MOCK_TOPICS: Topic[] = [
  { id: "vedic-astrology", label: "Vedic Astrology", sub: "Jyotish Vidya", icon: "qr_code_2" },
  { id: "numerology", label: "Numerology", sub: "Ank Jyotish", icon: "pin" },
  { id: "tarot", label: "Tarot Reading", sub: "Archetypal Divination", icon: "style" },
  { id: "palmistry", label: "Palmistry", sub: "Hastarekha Vigyan", icon: "front_hand" },
  { id: "vastu", label: "Vastu Shastra", sub: "Spatial Energy", icon: "home_pin" },
  { id: "gemstones", label: "Gemstones & Remedy", sub: "Ratna Vidya", icon: "diamond" },
  { id: "career-astrology", label: "Career Astrology", sub: "Karma & Profession", icon: "work" },
  { id: "nakshatra", label: "Nakshatra", sub: "27 Lunar Mansions", icon: "flare" },
  { id: "relationship-astrology", label: "Relationship Astrology", sub: "Kundli Milan & Synastry", icon: "favorite" },
  { id: "muhurats", label: "Muhurats", sub: "Auspicious Timings", icon: "hourglass_top" },
  { id: "kundli", label: "Kundli Reading", sub: "Birth Chart Synthesis", icon: "grid_goldenratio" },
  { id: "face-reading", label: "Face Reading", sub: "Samudrika Shastra", icon: "face" },
  { id: "zodiac", label: "Zodiac Signs", sub: "12 Rashi Archetypes", icon: "token" },
  { id: "lal-kitab", label: "Lal Kitab", sub: "Folk Astrological Remedies", icon: "menu_book" },
];

/** Pre-selected choices shown in the design. */
export const DEFAULT_GOAL: GoalId = "self";
export const DEFAULT_TOPICS = ["vedic-astrology", "numerology", "tarot", "vastu", "nakshatra"];

/** Shared artwork used on the onboarding banners. */
export const ONBOARDING_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBsHSUxRCdYye0S9yFHbxqLNIgywP_ZtiyGPWdVDYqazBSqHw7S7FUV36TkBHonyAefp4en9LTca_i3Ysei2IeuPMXWvJBqZixNTqF1RTdmfOHLQ_EvnyR4l0JfPCPltEgFSNEmaRynaz9I7lSiC18vW015RtHNppwgIctwl83cp3FZnX5h9badIycu8Rivi5TH4CmAKkdFIDlvOOasa6MhMIHXHI1c0e1EMBLCyphieQ0DUTyHWAgPWLLlin06d_v9I_g";
