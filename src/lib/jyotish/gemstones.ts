import type { JyotishReport, Text } from "./types";
import { planetHi, text } from "./knowledge";

// P.V.R. Narasimha Rao, Vedic Astrology: An Integrated Approach,
// §13.2 Table 30 and §34.2. This is one traditional school's classification,
// not a universal agreement or evidence of gemstone efficacy.
const nature: Record<
  number,
  { favourable: string[]; unfavourable: string[]; yogakaraka?: string }
> = {
  1: {
    favourable: ["Sun", "Mars", "Jupiter"],
    unfavourable: ["Mercury", "Venus", "Saturn"],
  },
  2: {
    favourable: ["Sun", "Mercury", "Saturn"],
    unfavourable: ["Moon", "Jupiter", "Venus"],
    yogakaraka: "Saturn",
  },
  3: { favourable: ["Venus"], unfavourable: ["Sun", "Mars", "Jupiter"] },
  4: {
    favourable: ["Moon", "Mars", "Jupiter"],
    unfavourable: ["Mercury", "Venus"],
    yogakaraka: "Mars",
  },
  5: {
    favourable: ["Sun", "Mars", "Jupiter"],
    unfavourable: ["Mercury", "Venus", "Saturn"],
    yogakaraka: "Mars",
  },
  6: {
    favourable: ["Mercury", "Venus"],
    unfavourable: ["Moon", "Mars", "Jupiter"],
  },
  7: {
    favourable: ["Mercury", "Venus", "Saturn"],
    unfavourable: ["Sun", "Mars", "Jupiter"],
    yogakaraka: "Saturn",
  },
  8: {
    favourable: ["Moon", "Jupiter"],
    unfavourable: ["Mercury", "Venus", "Saturn"],
  },
  9: { favourable: ["Sun", "Mars"], unfavourable: ["Venus", "Saturn"] },
  10: {
    favourable: ["Venus", "Mercury", "Saturn"],
    unfavourable: ["Mars", "Jupiter"],
    yogakaraka: "Venus",
  },
  11: {
    favourable: ["Venus", "Saturn"],
    unfavourable: ["Moon", "Mars", "Jupiter"],
    yogakaraka: "Venus",
  },
  12: {
    favourable: ["Moon", "Mars"],
    unfavourable: ["Sun", "Mercury", "Venus", "Saturn"],
  },
};
export type GemstonePick = {
  planet: string;
  reason: Text;
  context: Text;
  note?: Text;
};
export function gemstoneShortlist(
  report: Pick<JyotishReport, "chart" | "sensitivity" | "dasha">,
): { recommended: GemstonePick[]; avoid: GemstonePick[]; uncertain: boolean } {
  if (report.sensitivity.some((v) => v.varga === "D1" && v.changed))
    return { recommended: [], avoid: [], uncertain: true };
  const asc = report.chart.ascendant.sign,
    definition = nature[asc];
  if (!definition) return { recommended: [], avoid: [], uncertain: true };
  const owned = (id: string) =>
    report.chart.houses.filter((h) => h.signLord === id).map((h) => h.house);
  const score = (id: string) => {
    const houses = owned(id);
    return (
      (id === definition.yogakaraka
        ? 200
        : houses.includes(1)
          ? 100
          : houses.includes(9)
            ? 95
            : houses.includes(5)
              ? 85
              : 50) -
      (houses.some((h) => [6, 8, 12].includes(h)) ? 15 : 0) +
      (id === report.dasha.current.mahadasha.planet ? 4 : 0) +
      (id === report.dasha.current.antardasha.planet ? 2 : 0)
    );
  };
  const context = (id: string) =>
    text(
      `${id} rules house${owned(id).length > 1 ? "s" : ""} ${owned(id).join(" and ")} in your birth chart.`,
      `${planetHi[id]} आपकी जन्म कुंडली में भाव ${owned(id).join(" और ")} के स्वामी हैं।`,
    );
  const recommended = definition.favourable
    .slice()
    .sort((a, b) => score(b) - score(a) || a.localeCompare(b))
    .slice(0, 3)
    .map((id) => {
      const p = report.chart.planets[id],
        houses = owned(id);
      const reason =
        id === definition.yogakaraka
          ? text(
              "This planet combines an action house and a supportive trine: the strongest priority in this traditional method.",
              "यह ग्रह केंद्र और त्रिकोण का स्वामी है: इस पारंपरिक विधि में इसे सबसे अधिक प्राथमिकता मिलती है।",
            )
          : houses.includes(1)
            ? text(
                "Its planet rules your ascendant and is favourable in the selected tradition, making it a personal-support choice.",
                "इसका ग्रह आपके लग्न का स्वामी है और चुनी परंपरा में अनुकूल माना जाता है; इसलिए यह व्यक्तिगत सहयोग का विकल्प है।",
              )
            : houses.includes(9)
              ? text(
                  "Its planet rules your house of guidance and learning, a favourable association for this ascendant.",
                  "इसका ग्रह मार्गदर्शन और अध्ययन के भाव का स्वामी है, जो इस लग्न के लिए अनुकूल संबंध है।",
                )
              : houses.includes(5)
                ? text(
                    "Its planet rules your house of learning and creativity, a favourable association for this ascendant.",
                    "इसका ग्रह अध्ययन और सृजन के भाव का स्वामी है, जो इस लग्न के लिए अनुकूल संबंध है।",
                  )
                : text(
                    "Its planet is classified as favourable for your ascendant in the selected tradition.",
                    "चुनी परंपरा में इसका ग्रह आपके लग्न के लिए अनुकूल माना जाता है।",
                  );
      const note =
        p?.isCombust || p?.dignity === "Debilitated"
          ? text(
              "This planet is combust or debilitated in D1. Confirm the complete chart before deciding to wear its stone.",
              "यह ग्रह D1 में अस्त या नीच है। रत्न पहनने का निर्णय लेने से पहले पूरी कुंडली की पुष्टि करें।",
            )
          : houses.some((h) => [6, 8, 12].includes(h))
            ? text(
                "It also has mixed house ownership; treat this as an option to review, rather than a mandatory remedy.",
                "इसका अन्य भावों पर भी मिश्रित स्वामित्व है; इसे समीक्षा का विकल्प मानें, अनिवार्य उपाय नहीं।",
              )
            : undefined;
      return { planet: id, reason, context: context(id), note };
    });
  const avoid = definition.unfavourable
    .slice()
    .sort((a, b) => {
      const weights: Record<number, number> = {
        6: 50,
        8: 45,
        11: 35,
        3: 25,
        12: 20,
        7: 10,
        2: 5,
      };
      const priority = (id: string) =>
        owned(id).reduce((n, h) => n + (weights[h] || 0), 0);
      return priority(b) - priority(a) || a.localeCompare(b);
    })
    .slice(0, 3)
    .map((id) => ({
      planet: id,
      reason: text(
        "Its planet is unfavourable for your ascendant in this tradition. Strengthening it with a gemstone is not recommended by this method.",
        "इस परंपरा में इसका ग्रह आपके लग्न के लिए प्रतिकूल है। इस विधि में रत्न से इसे सुदृढ़ करने की सलाह नहीं दी जाती।",
      ),
      context: context(id),
    }));
  return { recommended, avoid, uncertain: false };
}
