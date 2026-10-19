import { ROUTES } from "@/config/routes";
import type { MasterclassPageContent } from "../types";

const IMG = "https://lh3.googleusercontent.com/aida-public/";

export const MOCK_PAGE_CONTENT: MasterclassPageContent = {
  studentsCount: "12000+",
  testimonials: [
    {
      id: "t1",
      name: "Ritu Sharma",
      city: "New Delhi",
      rating: 5,
      quote:
        "I joined the astrology masterclass just out of curiosity, but within two months I started reading charts for friends. The structure made everything easy to understand.",
    },
    {
      id: "t2",
      name: "Karan Mehta",
      city: "Mumbai",
      rating: 5,
      quote:
        "The Lal Kitab session was packed with practical remedies. The mentor answered every question patiently during the live Q&A.",
    },
    {
      id: "t3",
      name: "Ananya Iyer",
      city: "Bengaluru",
      rating: 5,
      quote:
        "Palmistry always felt mysterious to me. After one masterclass I could actually identify the major lines and what they indicate.",
    },
  ],
  faqs: [
    {
      id: "f1",
      question: "Do I need prior knowledge to join these masterclasses?",
      answer:
        "No prior knowledge is required! Our masterclasses are designed specifically from foundational concepts all the way to advanced applications, allowing complete beginners as well as seasoned practitioners to learn effectively.",
    },
    {
      id: "f2",
      question: "Will I learn practical prediction techniques?",
      answer:
        "Yes! Each masterclass emphasizes hands-on practical chart interpretation techniques, verified real-world examples, and step-by-step methodologies.",
    },
    {
      id: "f3",
      question: "Can I start consulting after completing a masterclass?",
      answer:
        "Many of our students start by consulting friends, family, and peers to gain confidence. For professional career consultancy, we also offer complete mentorship diplomas.",
    },
    {
      id: "f4",
      question: "Are the classes live or recorded?",
      answer:
        "The majority of masterclasses feature interactive live sessions with Q&A directly with the mentor, supplemented by recorded lifetime review access inside your learner dashboard.",
    },
    {
      id: "f5",
      question: "What topics are covered in the masterclasses?",
      answer:
        "We offer diverse subjects including Ashtakvarga, Palmistry, Gayatri Sadhana, Lal Kitab, BNN Astrology, Face Reading, Prashna Kundali, Crystal Healing, and much more.",
    },
  ],
  endorsements: [
    {
      id: "e1",
      alt: "Endorsement Photo 1",
      image: IMG + "AB6AXuCps5uhcfjDj_wF7kB2552H6iSEu8nc_CVOFgto7ui85t6Cx5sHpqkHHwdALTzj5tmsQekUPCTI4fyJH80Or6B2iVJAsQqod3qWgG-qyH_G3g7_7_jpuQiHAXLuGcYLeVdSgYTCRxKuM52p0iGRSjprRkflCcHQMfmfl6-Awt2KnxAzrSqt1bMEGVjZEVk5u56ADuvpv5PdlkL_lTvxnSNFI54rIqYRFLMwYXScyNmZP7BrlL6jrbWG9w",
    },
    {
      id: "e2",
      alt: "Endorsement Photo 2",
      image: IMG + "AB6AXuBBkJclGV_JXBEsIwVGB7IzR0nmkidvrfRMmSuZPN8oaVU1K4nMQ-Tw4jTtvV9mb3TASWCbJSTdWpDAWAN3Pi0wHfC3dwwEvwC9dDehMgLXcf9PUmOf6lV72-WKc-tJ-P2glY5FkA9f8b-x1KBrSb_ARQQVsb4GKsD7MLYmxUIbS5wQgzUllckjbnOz7QAAxO4uFLbksCUCfkuvj8BazhvT_Bip_07GlR4n6GUppm_xN4Nj7fUnr3Qg3w",
    },
    {
      id: "e3",
      alt: "Endorsement Photo 3",
      image: IMG + "AB6AXuAA-CrlWqhtnRBI_5wvBVKRF-IP9IqojAFTFKiJF6ETxmAwt-QMT_IpeZ5JGRb80e4UWKKc6qe8kn1EkeaxZHRw_lS0m1ZGu4N7UTYxcwuPaegrhj3TeiFDeH_LrIZ1zGGye6hs645cxuAPhyhKEjrCsocHn4SnhYJjeOuVjNqMR5OVk_d5XLGIlJ2W_Ji4S0lW1Hqfh0wK2dePJjamzchTRL1QqJMf3aOhaSZEWHtbHcgd83IsLTRY6w",
    },
    {
      id: "e4",
      alt: "Endorsement Photo 4",
      image: IMG + "AB6AXuA3fQfaQAXN62CLHyMhOQQhaN2wTRDUJGOOE9Uh9vU2ZY6Fw6KNQMS1y82YrtIXQCACpZzznnCZ9_2FNTjdCZZyM4jbgMRftnO34Hhehmm7-mgNMEGyhoF-XjmBXQ3J3oR49AtjNZF7c8ZBXlBSgVKKjQjl3RbBPywN1y_5vmu_XbUBJDrbhDt84F0lnHl8DUlpyk6Tjtcrmb0-a03EgCzkypcGbRQjooXP37r4CYQsEFl7NMzmlkF0lw",
    },
  ],
  ctaImage: IMG + "AB6AXuArvA2TR0ch9Pe0mo8eU5bABY0KzZqTbn2l64CAuGGBq1gsNfsrLmQL2DZgdJA7gmlz7bCNUqHQ5yMhhrBDHN1cFaxNwCHdod5BuTR2Fj0vfcO8643ipNipHbw41VO3c0Lm7JdBan3wcLo9lIDsetb9rEt7u6IDA-ZHrRrQDLBVM_sxb1ICCmtzD6G8Wlj7j8pyHel8_ZDWG6oc2mxNh8JhvGWLD1Ingehi-zmeUo9xzVtz__QU8tw7pg",
  footerColumns: [
    {
      title: "Company",
      links: [
        { label: "Who We Are", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms & Conditions", href: "#" },
        { label: "Refund Policy", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blogs", href: "#" },
        { label: "News", href: "#" },
        { label: "Videos", href: "#" },
        { label: "E-Books", href: "#" },
      ],
    },
    {
      title: "Courses",
      links: [
        "Rudraksha Course",
        "Kundli Mastery Course",
        "Retrograde Planet Course",
        "Lal Kitab Course",
        "Nakshatra Recorded Course",
        "Advance Numerology Course",
        "Medical Astrology Bootcamp",
        "Astro Vastu Course",
      ].map((label) => ({ label, href: ROUTES.courses })),
    },
    {
      title: "Webinar",
      links: [
        "KP Astrology Webinar",
        "Mega Astrology Webinar",
        "Kundli Pathshala Webinar",
        "Mega Numerology Webinar",
        "Palmistry Webinar",
      ].map((label) => ({ label, href: ROUTES.liveSessions })),
    },
  ],
};
