/** Full profile (GET /users/profile, §3.2). Fields never set are omitted by the API. */
export type Profile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  email?: string;
  /** Login number; read-only in the app (§3.3). */
  phoneNumber?: string;
  countryCode?: string;
  country?: string;
  state?: string;
  /** YYYY-MM-DD */
  dob?: string;
  /** HH:mm */
  tob?: string;
  /** Place of birth. */
  pob?: string;
  /** Name and email present. */
  isProfileComplete: boolean;
};

/** Editable fields (POST /users/update-profile). Send only what changed. */
export type ProfileChanges = Partial<Pick<Profile, "name" | "email" | "country" | "state" | "dob" | "tob" | "pob">> & {
  /** Asset URL returned by the profile-photo upload (§3.4). */
  avatar?: string;
};

export type DeleteAccountResult = {
  message: string;
  /** true → account is kept for a grace period and the learner can still cancel at next login. */
  scheduled: boolean;
};

/* ---- Orders (§8) ---- */

export type OrderStatus = "DRAFT" | "READY_FOR_PAYMENT" | "PAID" | "FULFILLED" | "FAILED" | "REFUNDED" | (string & {});

export type ProductType = "COURSE" | "SELF_PLACED" | "BUNDLE" | "EBOOK" | "WEBINAR" | "MASTERCLASS" | (string & {});

export type OrderItem = {
  id: string;
  itemType: ProductType;
  productId: string;
  title: string;
  amount: number;
  status: OrderStatus;
};

export type Order = {
  id: string;
  orderNumber: string;
  amount: number;
  discountAmount: number;
  couponCode: string | null;
  status: OrderStatus;
  paymentStatus: string;
  paymentId: string | null;
  beneficiaryType: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderPage = { orders: Order[]; total: number; page: number; limit: number };

/** One delivered product from GET /og-order/:id/product-details (§8.3). */
export type Deliverable = {
  id: string;
  title: string;
  productType: ProductType;
  status: string;
  /** Ebooks. */
  downloadUrl?: string;
  /** Webinars / masterclasses. */
  classDate?: string;
  replayUrl?: string | null;
  workbookUrl?: string | null;
};
