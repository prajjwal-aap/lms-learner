import type { Deliverable, Order, Profile } from "../types";

export const MOCK_PROFILE: Profile = {
  id: "l1",
  name: "Aarav Sharma",
  avatarUrl: null,
  email: "aarav.sharma@example.com",
  phoneNumber: "9876543210",
  countryCode: "91",
  country: "India",
  state: "Delhi",
  dob: "1994-03-21",
  tob: "06:30",
  pob: "New Delhi",
  isProfileComplete: true,
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "6702b3e1c3b2a10012ab3501",
    orderNumber: "OG-M1Z8K2QX-3F9A1C",
    amount: 2499,
    discountAmount: 0,
    couponCode: null,
    status: "FULFILLED",
    paymentStatus: "SUCCESS",
    paymentId: "pay_PZx9Lk2",
    beneficiaryType: "SELF",
    createdAt: "2026-10-08T06:20:00.000Z",
    items: [{ id: "i1", itemType: "COURSE", productId: "p1", title: "Advance Numerology Mentorship Program", amount: 2499, status: "FULFILLED" }],
  },
  {
    id: "6702b3e1c3b2a10012ab3610",
    orderNumber: "OG-K7P2D9WE-81B2C4",
    amount: 598,
    discountAmount: 100,
    couponCode: "VEDIC100",
    status: "FULFILLED",
    paymentStatus: "SUCCESS",
    paymentId: "pay_QaT3Mn8",
    beneficiaryType: "SELF",
    createdAt: "2026-09-14T11:05:00.000Z",
    items: [
      { id: "i2", itemType: "EBOOK", productId: "p2", title: "Kundli Reading Handbook", amount: 299, status: "FULFILLED" },
      { id: "i3", itemType: "EBOOK", productId: "p3", title: "108 Lal Kitab Upayas", amount: 399, status: "FULFILLED" },
    ],
  },
  {
    id: "6702b3e1c3b2a10012ab3722",
    orderNumber: "OG-R4Q8H1ZT-0C7E55",
    amount: 999,
    discountAmount: 0,
    couponCode: null,
    status: "FAILED",
    paymentStatus: "FAILED",
    paymentId: null,
    beneficiaryType: "SELF",
    createdAt: "2026-08-30T17:42:00.000Z",
    items: [{ id: "i4", itemType: "MASTERCLASS", productId: "p4", title: "Mega Numerology Masterclass", amount: 999, status: "FAILED" }],
  },
];

export const MOCK_DELIVERABLES: Record<string, Deliverable[]> = {
  "6702b3e1c3b2a10012ab3501": [{ id: "d1", title: "Advance Numerology Mentorship Program", productType: "COURSE", status: "FULFILLED" }],
  "6702b3e1c3b2a10012ab3610": [
    { id: "d2", title: "Kundli Reading Handbook", productType: "EBOOK", status: "FULFILLED", downloadUrl: "#" },
    { id: "d3", title: "108 Lal Kitab Upayas", productType: "EBOOK", status: "FULFILLED", downloadUrl: "#" },
  ],
};
