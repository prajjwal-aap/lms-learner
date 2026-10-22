/** Cart / checkout types (OG_APP_API_REFERENCE §6–§7). Money is in rupees. */

/** Cart & checkout product types (catalog types plus the legacy SELF_PLACED). */
export type CartProductType = "COURSE" | "SELF_PLACED" | "WEBINAR" | "BUNDLE" | "EBOOK" | "MASTERCLASS";

export type CartItem = {
  id: string;
  productId: string;
  productSlug: string;
  productType: CartProductType;
  title: string;
  mrp: number;
  sp: number;
  quantity: number;
  batchId: string | null;
  media: string | null;
  /** Set on items added through the app cart (POST /app/v1/cart/items). */
  planId?: string | null;
  liveSessionId?: string | null;
  addedAt: string;
};

export type Cart = {
  id: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  payable: number;
  couponCode: string | null;
  items: CartItem[];
};

/** POST /app/v1/cart/items (§6): catalog product id + plan (default plan when missing) + slot for live products. */
export type AddToCartInput = {
  productId: string;
  /** Not sent to the server; used by mock mode and analytics. */
  productSlug: string;
  productType: CartProductType;
  planId?: string;
  liveSessionId?: string;
};

/* ---- Checkout ---- */

export type Beneficiary = { type: "SELF" } | { type: "FAMILY_MEMBER" | "REGISTERED_USER"; id: string };

export type CheckoutRequest =
  | { mode: "cart"; couponCode?: string | null }
  | {
      mode: "buy";
      productId: string;
      productType: CartProductType;
      title: string;
      /** Rupees, for the review step and analytics. */
      amount: number;
      planId?: string;
      liveSessionId?: string;
    };

export type Gateway = "RAZORPAY" | "CASHFREE" | "FREE";

/** POST /app/v1/prepare-order-payment response (§7.1). */
export type PreparedPayment = {
  order_id: string;
  payment_order_id: string;
  gateway: Gateway;
  gateway_order_id: string | null;
  payment_session_id: string | null;
  amount: number;
  currency: string;
  status: string;
  items: { productId: string; title: string; amount: number }[];
};

export type Relation = "self" | "spouse" | "child" | "parent" | "sibling" | "other";

export type FamilyMember = {
  id: string;
  kind: "PROFILE" | "CONTACT";
  name: string;
  relation: Relation | string;
  phoneNumber?: string;
};

/** POST /users/beneficiaries/resolve (§4.1). */
export type ResolvedBeneficiary = {
  beneficiary: Beneficiary;
  person: { memberId: string; name: string; relation: string; maskedPhone: string; isOwnLogin: boolean };
};
