import { twMerge } from "tailwind-merge";

/** Join class names; later Tailwind utilities override earlier conflicting ones. */
export const cn = (...c: (string | false | null | undefined)[]) => twMerge(c.filter(Boolean).join(" "));

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
