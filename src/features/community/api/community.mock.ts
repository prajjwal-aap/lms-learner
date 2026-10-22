import { Book, Compass, MessageCircleMore } from "lucide-react";
import type { CommunitySidebar, HeroSlide, Post } from "../types";
import { ROUTES } from "@/config/routes";

const INSTRUCTOR_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCz--0r2VnArxoKps_kBnLGrhSlsG2ra0Pi-Rh7srSlKCopt2HHPWUyymY6uukS623S0tVP-4_xieJFFEacaZhE_wHhFFLn0PM7rht10EvwJmV8dTZ9vHN0yuaHaaVupbekrjm8n4dsAzkVfv-a36VzYP4B5S95hZMNvPFofArDyIYDaPqlihasxL51xuFUcyzOxwDBN-rRon_qCrtMgR5XZy1ApLTZ0kJVjR1K7K3rc-9MyLwr_eknmQ";

export const MOCK_SIDEBAR: CommunitySidebar = {
  nav: [
    { id: "feed", label: "Feed", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageCircleMore, badge: 1 },
  ],
  groups: [
    {
      id: "bhrigu-nandi-nadi",
      name: "Bhrigu Nandi Nadi",
      hasUnread: true,
      channels: [
        { id: "bnn-bootcamp", name: "BNN_BnnBoocamp", icon: Book, iconClassName: "text-emerald-600", badge: 2 },
      ],
    },
    {
      id: "mahalay-sadhana",
      name: "Mahalay Sadhana",
      hasUnread: false,
      channels: [
        { id: "mahalay-oct-2026", name: "Mahalay Sadhana (Online) Oct 2026", icon: Book, iconClassName: "text-amber-600" },
      ],
    },
  ],
};

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "swar-vigyan",
    title: "Swar Vigyan 2.0 Bootcamp",
    tagline: "— Master Breath, Tatvas & Timing Unlock —",
    description:
      "The ancient science of breath (Swar) and learn how to use Tatvas (elements) for powerful decision-making, energy alignment, and spiritual growth.",
    ctaLabel: "Enroll Now",
    href: ROUTES.store,
    imageUrl: INSTRUCTOR_IMG,
    imageAlt: "Instructor smiling wearing traditional attire",
  },
  {
    id: "advance-numerology",
    title: "Advance Numerology Mentorship",
    tagline: "— Decode Names, Numbers & Destiny —",
    description:
      "A guided mentorship covering Lo Shu grids, name correction and predictive numerology with weekly live doubt-clearing sessions.",
    ctaLabel: "Enroll Now",
    href: ROUTES.product("advance-numerology-mentorship"),
    imageUrl: INSTRUCTOR_IMG,
    imageAlt: "Instructor smiling wearing traditional attire",
  },
  {
    id: "bnn-bootcamp",
    title: "Bhrigu Nandi Nadi Bootcamp",
    tagline: "— Predict With Planetary Combinations —",
    description:
      "Learn the Nadi technique of reading planetary links without ascendant or houses, with real chart practice in every class.",
    ctaLabel: "Enroll Now",
    href: ROUTES.store,
    imageUrl: INSTRUCTOR_IMG,
    imageAlt: "Instructor smiling wearing traditional attire",
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post-mahalay",
    pinned: true,
    author: { name: "Occult Gurukul" },
    postedAgo: "4w",
    postedAt: "2026-09-17T10:00:00+05:30",
    channelId: "mahalay-oct-2026",
    channelName: "Mahalay Sadhana (Online) Oct 2026",
    extraAudience: 450,
    paragraphs: [
      { text: "🌸 Radhe Radhe, Dear Learners! 🌸" },
      { text: "MAHALAY AMAVASYA | ENROLMENTS ARE NOW OPEN 🌑✨", strong: true },
      {
        text: "This 10 October, experience a deeply immersive Mahalay Amavasya gathering with Gurumaa in Noida, dedicated to ancestral healing, Devi wisdom and practical spiritual learning.",
      },
      {
        text: "Mahalay Amavasya is a significant time for remembering and honouring our ances-tors. This special gathering creates an opportunity to connect with your lineage through guided rituals, mantra chanting and meditation, and to understand the practices that bring peace to departed souls.",
      },
      { text: "Seats are limited. Enrol from the Store section and join the Mahalay Sadhana group for all updates. 🙏" },
    ],
    likes: 9,
    likedByMe: false,
    views: 1890,
    comments: [
      { id: "c1", author: "Ritika S.", text: "Will the recording be shared for online learners?", postedAgo: "4w" },
      { id: "c2", author: "Occult Gurukul", text: "Yes, recordings are available in the Live Sessions tab after the gathering.", postedAgo: "4w" },
      { id: "c3", author: "Manish K.", text: "Radhe Radhe 🙏 Enrolled!", postedAgo: "3w" },
    ],
  },
  {
    id: "post-bnn-homework",
    pinned: false,
    author: { name: "Occult Gurukul" },
    postedAgo: "2d",
    postedAt: "2026-10-13T18:00:00+05:30",
    channelId: "bnn-bootcamp",
    channelName: "BNN_BnnBoocamp",
    paragraphs: [
      { text: "📘 Session 4 practice charts are now live!", strong: true },
      {
        text: "Before Thursday's doubt-clearing class, analyse the three practice charts shared in the resources section. Note the Jupiter–Saturn links and the karaka for career in each chart.",
      },
      { text: "Post your observations below — we will pick a few answers to discuss live." },
    ],
    likes: 14,
    likedByMe: true,
    views: 612,
    comments: [{ id: "c4", author: "Ankit P.", text: "Chart 2 has a strong Saturn–Mercury link for career.", postedAgo: "1d" }],
  },
  {
    id: "post-numerology-tip",
    pinned: false,
    author: { name: "Occult Gurukul" },
    postedAgo: "5d",
    postedAt: "2026-10-10T09:00:00+05:30",
    channelId: "bnn-bootcamp",
    channelName: "BNN_BnnBoocamp",
    paragraphs: [
      { text: "✨ Tip of the week" },
      {
        text: "When a number repeats three or more times in the Lo Shu grid, look at the missing numbers on the same plane before suggesting any remedy. Excess energy is usually a sign of an imbalance elsewhere.",
      },
    ],
    likes: 31,
    likedByMe: false,
    views: 2405,
    comments: [],
  },
];
