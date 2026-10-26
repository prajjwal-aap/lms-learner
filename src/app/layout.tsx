import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Schibsted_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted-grotesk", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Occult Gurukul", template: "%s · Occult Gurukul" },
  description: "Learner portal for Occult Gurukul — courses, live sessions and community",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${schibsted.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
