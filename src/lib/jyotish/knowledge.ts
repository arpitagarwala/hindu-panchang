import type { Text, Reading } from "./types";
import type { ChartCalculationResult } from "../astronomy/ephemeris";
export const planetHi: Record<string, string> = {
  Sun: "सूर्य",
  Moon: "चंद्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
};
export const signHi = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुंभ",
  "मीन",
];
export const nakshatraHi = [
  "अश्विनी",
  "भरणी",
  "कृत्तिका",
  "रोहिणी",
  "मृगशिरा",
  "आर्द्रा",
  "पुनर्वसु",
  "पुष्य",
  "आश्लेषा",
  "मघा",
  "पूर्वा फाल्गुनी",
  "उत्तरा फाल्गुनी",
  "हस्त",
  "चित्रा",
  "स्वाती",
  "विशाखा",
  "अनुराधा",
  "ज्येष्ठा",
  "मूल",
  "पूर्वाषाढ़ा",
  "उत्तराषाढ़ा",
  "श्रवण",
  "धनिष्ठा",
  "शतभिषा",
  "पूर्वाभाद्रपदा",
  "उत्तराभाद्रपदा",
  "रेवती",
];
export const text = (en: string, hi: string): Text => ({ en, hi });
export const houseThemes: Text[] = [
  text("self-direction and daily habits", "आत्मदिशा और दिनचर्या"),
  text("saving, family and speech", "बचत, परिवार और वाणी"),
  text("communication and consistent effort", "संवाद और नियमित प्रयास"),
  text("home and emotional grounding", "घर और भावनात्मक संतुलन"),
  text("learning and creative practice", "अध्ययन और रचनात्मक अभ्यास"),
  text(
    "service, routines and resolving obligations",
    "सेवा, दिनचर्या और जिम्मेदारियाँ",
  ),
  text("partnership and listening", "साझेदारी और सुनना"),
  text("research and handling uncertainty", "शोध और अनिश्चितता से निपटना"),
  text("mentors, study and perspective", "मार्गदर्शन, अध्ययन और दृष्टिकोण"),
  text("career skills and responsibility", "कौशल और पेशेवर जिम्मेदारी"),
  text("community and long-term goals", "समुदाय और दीर्घकालीन लक्ष्य"),
  text("rest, reflection and boundaries", "विश्राम, मनन और सीमाएँ"),
];
export const practices: Record<string, Text> = {
  Sun: text(
    "Practise clear leadership and keep promises.",
    "स्पष्ट नेतृत्व का अभ्यास करें और वचन निभाएँ।",
  ),
  Moon: text(
    "Keep a steady sleep routine and make space for reflection.",
    "नियमित नींद और शांत मनन के लिए समय रखें।",
  ),
  Mars: text(
    "Channel energy into a manageable task and pause before reacting.",
    "ऊर्जा को छोटे कार्य में लगाएँ और प्रतिक्रिया से पहले रुकें।",
  ),
  Mercury: text(
    "Write clearly, check details and practise a useful skill.",
    "स्पष्ट लिखें, विवरण जाँचें और उपयोगी कौशल सीखें।",
  ),
  Jupiter: text(
    "Read, teach or seek thoughtful guidance.",
    "पढ़ें, सिखाएँ या विचारशील मार्गदर्शन लें।",
  ),
  Venus: text(
    "Make room for art, kindness and honest dialogue.",
    "कला, दयालुता और ईमानदार संवाद को समय दें।",
  ),
  Saturn: text(
    "Choose small sustainable commitments and finish unfinished work.",
    "छोटी टिकाऊ जिम्मेदारियाँ चुनें और अधूरे काम पूरे करें।",
  ),
  Rahu: text(
    "Explore new ideas with source checking and clear limits.",
    "नए विचारों को स्रोत-जाँच और स्पष्ट सीमाओं के साथ अपनाएँ।",
  ),
  Ketu: text(
    "Simplify distractions and practise quiet reflection.",
    "ध्यान भटकाने वाली चीजें कम करें और शांत मनन करें।",
  ),
};
export const associations: Record<
  string,
  {
    color: Text;
    day: Text;
    direction: Text;
    stone: Text;
    finger: Text;
    metal: Text;
    purpose: Text;
  }
> = {
  Sun: {
    color: text("Saffron / warm gold", "केसरिया / सुनहरा"),
    day: text("Sunday", "रविवार"),
    direction: text("East", "पूर्व"),
    stone: text("Ruby · Manik", "माणिक"),
    finger: text("Ring finger", "अनामिका"),
    metal: text("Gold", "सोना"),
    purpose: text(
      "Confidence and leadership symbolism",
      "आत्मविश्वास और नेतृत्व का प्रतीक",
    ),
  },
  Moon: {
    color: text("White / cream", "सफेद / क्रीम"),
    day: text("Monday", "सोमवार"),
    direction: text("North-west", "उत्तर-पश्चिम"),
    stone: text("Pearl · Moti", "मोती"),
    finger: text(
      "Little finger (some schools use ring finger)",
      "कनिष्ठा (कुछ परंपराओं में अनामिका)",
    ),
    metal: text("Silver", "चाँदी"),
    purpose: text(
      "Calm and emotional steadiness symbolism",
      "शांति और भावनात्मक स्थिरता का प्रतीक",
    ),
  },
  Mars: {
    color: text("Red / terracotta", "लाल / गेरुआ"),
    day: text("Tuesday", "मंगलवार"),
    direction: text("South", "दक्षिण"),
    stone: text("Red coral · Moonga", "लाल मूंगा"),
    finger: text("Ring finger", "अनामिका"),
    metal: text("Gold or copper", "सोना या ताँबा"),
    purpose: text("Courage and initiative symbolism", "साहस और पहल का प्रतीक"),
  },
  Mercury: {
    color: text("Green", "हरा"),
    day: text("Wednesday", "बुधवार"),
    direction: text("North", "उत्तर"),
    stone: text("Emerald · Panna", "पन्ना"),
    finger: text("Little finger", "कनिष्ठा"),
    metal: text("Gold", "सोना"),
    purpose: text(
      "Learning and communication symbolism",
      "अध्ययन और संवाद का प्रतीक",
    ),
  },
  Jupiter: {
    color: text("Yellow", "पीला"),
    day: text("Thursday", "गुरुवार"),
    direction: text("North-east", "उत्तर-पूर्व"),
    stone: text("Yellow sapphire · Pukhraj", "पीला पुखराज"),
    finger: text("Index finger", "तर्जनी"),
    metal: text("Gold", "सोना"),
    purpose: text("Wisdom and learning symbolism", "विवेक और अध्ययन का प्रतीक"),
  },
  Venus: {
    color: text("Pastels / white", "हल्के रंग / सफेद"),
    day: text("Friday", "शुक्रवार"),
    direction: text("South-east", "दक्षिण-पूर्व"),
    stone: text("Diamond / white sapphire", "हीरा / सफेद पुखराज"),
    finger: text(
      "Ring or middle finger; varies by school",
      "अनामिका या मध्यमा; परंपरा पर निर्भर",
    ),
    metal: text("Silver or platinum", "चाँदी या प्लेटिनम"),
    purpose: text("Art and harmony symbolism", "कला और सामंजस्य का प्रतीक"),
  },
  Saturn: {
    color: text("Indigo / navy", "नील / गहरा नीला"),
    day: text("Saturday", "शनिवार"),
    direction: text("West", "पश्चिम"),
    stone: text("Blue sapphire · Neelam", "नीलम"),
    finger: text("Middle finger", "मध्यमा"),
    metal: text(
      "Silver or iron; varies by school",
      "चाँदी या लोहा; परंपरा पर निर्भर",
    ),
    purpose: text(
      "Discipline and patience symbolism",
      "अनुशासन और धैर्य का प्रतीक",
    ),
  },
  Rahu: {
    color: text("Smoky grey", "धूसर"),
    day: text(
      "Saturday (common modern convention)",
      "शनिवार (प्रचलित आधुनिक परंपरा)",
    ),
    direction: text("South-west", "दक्षिण-पश्चिम"),
    stone: text("Hessonite · Gomed", "गोमेद"),
    finger: text("Middle finger; varies by school", "मध्यमा; परंपरा पर निर्भर"),
    metal: text("Silver", "चाँदी"),
    purpose: text(
      "Focus amid unfamiliar situations symbolism",
      "अपरिचित परिस्थिति में एकाग्रता का प्रतीक",
    ),
  },
  Ketu: {
    color: text("Muted earth tones", "मिट्टी जैसे हल्के रंग"),
    day: text(
      "Tuesday (common modern convention)",
      "मंगलवार (प्रचलित आधुनिक परंपरा)",
    ),
    direction: text("No single agreed direction", "एक सर्वमान्य दिशा नहीं"),
    stone: text("Cat’s eye · Lehsunia", "लहसुनिया"),
    finger: text(
      "Middle or ring finger; varies by school",
      "मध्यमा या अनामिका; परंपरा पर निर्भर",
    ),
    metal: text("Silver", "चाँदी"),
    purpose: text(
      "Reflection and detachment symbolism",
      "मनन और अनासक्ति का प्रतीक",
    ),
  },
};
export function buildReadings(
  chart: ChartCalculationResult,
  md: string,
  ad: string,
): Reading[] {
  const topics = [
    { title: text("Your current chapter", "आपका वर्तमान अध्याय"), planet: md },
    { title: text("The shorter-term focus", "निकट अवधि का ध्यान"), planet: ad },
    {
      title: text("Work and purpose", "कार्य और उद्देश्य"),
      planet: chart.houses[9].signLord,
    },
    {
      title: text("Relationships and cooperation", "संबंध और सहयोग"),
      planet: chart.houses[6].signLord,
    },
    {
      title: text("Learning and creativity", "अध्ययन और रचनात्मकता"),
      planet: chart.houses[4].signLord,
    },
    {
      title: text("Home and grounding", "घर और संतुलन"),
      planet: chart.houses[3].signLord,
    },
  ];
  return topics.map(({ title, planet }) => {
    const p = chart.planets[planet],
      theme = houseThemes[p.house - 1];
    return {
      title,
      body: text(
        `In a traditional whole-sign reading, ${planet} draws attention to ${theme.en}. Use this as a reflection theme, not a promised event.`,
        `पारंपरिक पूर्ण-राशि व्याख्या में ${planetHi[planet]} ${theme.hi} की ओर ध्यान दिलाते हैं। यह मनन का विषय है, घटना की गारंटी नहीं।`,
      ),
      reason: text(
        `${planet}: house ${p.house}, ${p.signName}. Dasha focus: ${md} / ${ad}.`,
        `${planetHi[planet]}: भाव ${p.house}, ${signHi[p.sign - 1]}। दशा: ${planetHi[md]} / ${planetHi[ad]}।`,
      ),
      action: practices[planet],
      caution: text(
        "Avoid impulsive commitments or treating an astrological theme as certainty.",
        "जल्दबाजी में वचन देने या ज्योतिषीय विषय को निश्चित मानने से बचें।",
      ),
    };
  });
}
