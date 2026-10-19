/** Mentor option in the sidebar filter (derived from the catalog products' mentors). */
export type Mentor = {
  id: string;
  name: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type Endorsement = {
  id: string;
  image: string;
  alt: string;
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

/** Static marketing content around the catalogue (legacy, endorsements, reviews, FAQ, footer). */
export type MasterclassPageContent = {
  testimonials: Testimonial[];
  faqs: Faq[];
  endorsements: Endorsement[];
  ctaImage: string;
  studentsCount: string;
  footerColumns: FooterColumn[];
};
