import { mockDelay } from "@/lib/mockApi";
import type { MasterclassPageContent } from "../types";
import { MOCK_PAGE_CONTENT } from "./masterclasses.mock";

// Static marketing content (testimonials, FAQ, endorsements, footer) — not part of the catalog API.
// The masterclass / webinar listings themselves come from the catalog (§5).
export async function getMasterclassPageContent(): Promise<MasterclassPageContent> {
  await mockDelay();
  return MOCK_PAGE_CONTENT;
}
