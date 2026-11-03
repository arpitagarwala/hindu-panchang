import type { Metadata } from "next";
import JyotishApp from "@/components/Jyotish/JyotishApp";
export const metadata: Metadata = {
  title: "Free Kundali & Jyotish · Birth Charts, Dasha & Personal Guide",
  description:
    "Generate a free Kundali from your birth date, time and place. Explore D1, D2, D9, D10, 14 divisional charts, Vimshottari periods and traditional guidance in English or Hindi.",
  alternates: { canonical: "/jyotish" },
  openGraph: {
    title: "Free Kundali & Jyotish",
    description:
      "Birth charts, Vimshottari periods and traditional guidance in Hindi and English.",
    url: "/jyotish",
    type: "website",
  },
};
export default function JyotishPage() {
  return <JyotishApp />;
}
