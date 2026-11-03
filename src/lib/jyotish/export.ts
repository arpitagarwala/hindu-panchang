import type { JyotishReport } from "./types";
import { associations, planetHi, signHi, nakshatraHi } from "./knowledge";
import { ZODIAC_SIGNS } from "../astronomy/constants";
import { northLabels } from "./chart-layout";
const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** Standalone, script-free personal report. No remote fonts, analytics or assets. */
export function reportHtml(r: JyotishReport, hi: boolean) {
  const lang = hi ? "hi" : "en",
    t = (en: string, hindi: string) => (hi ? hindi : en);
  const planet = (id: string) => (hi ? planetHi[id] : id);
  const sign = (n: number) => (hi ? signHi[n - 1] : ZODIAC_SIGNS[n - 1].name);
  const date = (v: string) =>
    new Date(v).toLocaleString(hi ? "hi-IN" : "en-IN", {
      timeZone: r.input.residence.timeZone,
      dateStyle: "medium",
      timeStyle: "short",
      hourCycle: "h23",
    });
  const rows = (items: unknown[][]) =>
    items
      .map(
        (row) => `<tr>${row.map((v) => `<td>${escape(v)}</td>`).join("")}</tr>`,
      )
      .join("");
  const table = (headings: string[], items: unknown[][]) =>
    `<div class="scroll"><table><thead><tr>${headings.map((h) => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${rows(items)}</tbody></table></div>`;
  const section = (title: string, content: string) =>
    `<section><h2>${escape(title)}</h2>${content}</section>`;
  const a = associations[r.chart.ascendant.signLord];
  const body = [
    section(
      t("Your reading", "आपका पाठ"),
      r.readings
        .map(
          (x) =>
            `<h3>${escape(x.title[lang])}</h3><p>${escape(x.body[lang])}</p><p>${escape(x.action[lang])}</p><p>${escape(x.caution[lang])}</p><small>${escape(x.reason[lang])}</small>`,
        )
        .join(""),
    ),
    section(
      t("Traditional personal associations", "व्यक्तिगत पारंपरिक संबंध"),
      `<p>${escape(a.color[lang])} · ${escape(a.day[lang])} · ${escape(a.direction[lang])}</p><p>${t("Numerology birth / destiny", "अंकशास्त्र मूलांक / भाग्यांक")}: ${r.numerology.birth} / ${r.numerology.destiny}</p><p>${t("Symbolic associations only. No outfit or direction is proven harmful or lucky for this birth chart.", "केवल प्रतीकात्मक संबंध। कुंडली से कोई वस्त्र या दिशा हानिकारक या भाग्यशाली सिद्ध नहीं होती।")}</p>`,
    ),
    section(
      t("Natal planetary details", "जन्म ग्रह विवरण"),
      table(
        [
          t("Graha", "ग्रह"),
          t("D1 sign / degree", "D1 राशि / अंश"),
          t("Nakshatra / pada", "नक्षत्र / पद"),
          t("Motion", "गति"),
        ],
        Object.values(r.chart.planets).map((p) => [
          planet(p.id),
          `${sign(p.sign)} ${p.dms}`,
          `${hi ? nakshatraHi[p.nakshatra - 1] : p.nakshatraName} · ${p.pada}`,
          `${p.isRetrograde ? "℞" : t("Direct", "मार्गी")} ${p.isCombust ? t("Combust (traditional orb)", "अस्त (पारंपरिक सीमा)") : ""}`,
        ]),
      ),
    ),
    ...Object.values(r.vargas).map((v) =>
      section(
        `${v.varga} · ${v.meta.name}`,
        `<p>${t("Ascendant", "लग्न")}: ${escape(sign(v.ascendantSign))}</p><svg viewBox="0 0 500 500" style="max-width:420px;width:100%;display:block;margin:auto" role="img" aria-label="${v.varga}"><rect x="2" y="2" width="496" height="496" fill="#fffaf1" stroke="#80603c"/><path d="M2 2L498 498M498 2L2 498M250 2L498 250L250 498L2 250Z" fill="none" stroke="#80603c"/>${northLabels(
          v,
          hi,
        )
          .map(
            (l) =>
              `<text x="${l.x}" y="${l.y}" text-anchor="middle" font-size="15" fill="#302214">${escape(l.label)}</text>`,
          )
          .join("")}</svg>${table(
          [t("Graha", "ग्रह"), t("Sign", "राशि"), t("House", "भाव")],
          Object.values(v.placements).map((p) => [
            planet(p.id),
            sign(p.sign),
            p.house,
          ]),
        )}`,
      ),
    ),
    section(
      t("Dasha timeline", "दशा समयरेखा"),
      `<p>${escape(r.dasha.current.path)} · ${t("Year length: 365.242199 days; other conventions can shift dates.", "वर्ष: 365.242199 दिन; अन्य विधि से तिथियाँ बदल सकती हैं।")}</p>${r.dasha.periods
        .map(
          (md) =>
            `<h3>${escape(planet(md.planet))} · ${escape(date(md.startDate))} → ${escape(date(md.endDate))}</h3>${table(
              [
                t("Antardasha", "अंतरदशा"),
                t("Begins", "आरंभ"),
                t("Ends", "समाप्ति"),
              ],
              (md.subPeriods || []).map((ad) => [
                planet(ad.planet),
                date(ad.startDate),
                date(ad.endDate),
              ]),
            )}`,
        )
        .join("")}`,
    ),
    section(
      t("12 monthly snapshots", "12 मासिक झलकियाँ"),
      `<p>${t("Noon samples on the listed dates, not month-long predictions. Simplified Moon-sign gochara sets: Jupiter 2/5/7/9/11, Saturn 3/6/11, Mercury 2/4/6/8/10/11. Vedha and a complete aspect synthesis are not included.", "दी गई तिथियों की दोपहर की झलक, पूरे महीने की भविष्यवाणी नहीं। सरल चंद्र-गोचर भाव: गुरु 2/5/7/9/11, शनि 3/6/11, बुध 2/4/6/8/10/11। वेध और पूर्ण दृष्टि संश्लेषण शामिल नहीं हैं।")}</p>${table(
        [
          t("Date", "तिथि"),
          t("Dasha", "दशा"),
          t("Transit themes", "गोचर विषय"),
        ],
        r.forecast.map((x) => [
          x.date,
          planet(x.mahadasha) + " / " + planet(x.antardasha),
          x.transits
            .map(
              (v) =>
                `${planet(v.planet)}: ${sign(v.sign)} · ${v.houseFromMoon} · ${v.supportive ? t("Traditional support", "पारंपरिक समर्थन") : t("Proceed thoughtfully", "विचारपूर्वक आगे बढ़ें")}${v.retrograde ? " ℞" : ""}`,
            )
            .join("; "),
        ]),
      )}`,
    ),
    section(
      t("Daily windows", "दैनिक समय"),
      `<p>${escape(r.day.place)} · ${r.day.date} · ${escape(r.day.timeZone)}</p><p>${t("Tara bala", "ताराबल")}: ${escape(r.day.taraName[lang])} · ${t("Chandra house at noon", "दोपहर का चंद्र भाव")}: ${r.day.chandraHouse}</p>${table(
        [t("Window", "समय"), t("Begins", "आरंभ"), t("Ends", "समाप्ति")],
        r.day.windows.map((w) => [w.name[lang], date(w.start), date(w.end)]),
      )}<p>${t("Shared local Panchang windows, not personalised guarantees. Supportive and caution windows can overlap. No solar windows are invented for polar dates.", "साझा स्थानीय पंचांग समय, व्यक्तिगत गारंटी नहीं। शुभ और सावधानी के समय मिल सकते हैं। ध्रुवीय तिथियों पर सौर समय गढ़े नहीं गए हैं।")}</p>`,
    ),
    section(
      t(
        "Gemstone reference · not a prescription",
        "रत्न संदर्भ · पहनने का निर्देश नहीं",
      ),
      `<p>${t("Finger, metal and weekday customs differ. A chart cannot establish an effective gemstone dose, weight or guaranteed benefit. Avoid choosing a stone solely from an active dasha or a weak planet.", "उँगली, धातु और वार की परंपराएँ भिन्न हैं। कुंडली से रत्न की प्रभावी मात्रा, वजन या लाभ सुनिश्चित नहीं होता। केवल सक्रिय दशा या कमजोर ग्रह से रत्न न चुनें।")}</p>${table(
        [
          t("Graha / houses ruled", "ग्रह / भाव स्वामित्व"),
          t("Stone", "रत्न"),
          t("Finger", "उँगली"),
          t("Metal", "धातु"),
          t("Weekday / symbolism", "वार / प्रतीक"),
        ],
        Object.entries(associations).map(([id, v]) => [
          planet(id) +
            " · " +
            (r.chart.houses
              .filter((h) => h.signLord === id)
              .map((h) => h.house)
              .join(", ") || "—"),
          v.stone[lang],
          v.finger[lang],
          v.metal[lang],
          v.day[lang] + " · " + v.purpose[lang],
        ]),
      )}<p>${t("Illustrative jewellery conversion only: 1 ratti ≈ 0.182 g ≈ 0.91 ct. Standards vary; verify certified carat weight. This is not a recommended dose.", "केवल उदाहरण ज्वेलरी रूपांतरण: 1 रत्ती ≈ 0.182 ग्राम ≈ 0.91 कैरेट। मान भिन्न हैं; प्रमाणित कैरेट जाँचें। यह अनुशंसित मात्रा नहीं है।")}</p>`,
    ),
    section(
      t("Birth-time sensitivity", "जन्म समय की संवेदनशीलता"),
      `<p>±${r.input.uncertaintyMinutes} min · ${escape(
        r.sensitivity
          .filter((x) => x.changed)
          .map((x) => x.varga)
          .join(", ") ||
          t(
            "No endpoint placement changes detected; not proof of certainty.",
            "सीमा बिंदुओं पर परिवर्तन नहीं मिला; यह शुद्धता का प्रमाण नहीं।",
          ),
      )}</p><p>${t("Only endpoints are compared. Intermediate changes can be missed. D2 is Sun/Moon Parashari Hora and D60 counts from the natal sign. High divisions require a carefully verified birth time.", "केवल सीमा बिंदु जाँचे गए हैं; बीच के बदलाव छूट सकते हैं। D2 सूर्य-चंद्र पाराशरी होरा है और D60 की गिनती जन्म राशि से है। उच्च वर्गों के लिए जन्म समय सावधानी से जाँचें।")}</p>`,
    ),
  ].join("");
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(r.input.name || t("Your Kundali", "आपकी कुंडली"))} · Kundali</title><style>body{max-width:1000px;margin:auto;padding:24px;font:16px/1.7 system-ui;color:#272019;background:#fffaf1}h1,h2{font-family:Georgia,serif}section{margin:25px 0;border-top:1px solid #bcae96;padding-top:18px}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #d2c3ab;padding:9px;text-align:left}.scroll{overflow:auto}small{color:#645748}@media print{section{break-inside:avoid}body{background:white}}</style><h1>${escape(r.input.name || t("Your Kundali", "आपकी कुंडली"))}</h1><p>${escape(r.input.date)} ${escape(r.input.time)} · ${escape(r.input.place)} · ${escape(r.input.timeZone)}<br>UTC ${escape(r.birthInstant)} · Lahiri ${escape(r.chart.ayanamsaDms)} · ${escape(r.input.node)} nodes · whole-sign houses</p><p>${t("Traditional Jyotish interpretation, not a reliable prediction. Gemstones, colours and numbers have no established ability to change outcomes.", "पारंपरिक ज्योतिषीय व्याख्या, विश्वसनीय भविष्यवाणी नहीं। रत्न, रंग या अंक से परिणाम बदलने का प्रमाण नहीं है।")}</p><p>${t("Generated", "बनाया गया")}: ${escape(date(r.generatedAt))} · ${t("Reading date", "पाठ की तिथि")}: ${r.input.targetDate}</p>${body}<footer>${t("Created and owned by", "निर्माता और स्वामी")} <a href="https://arpitagarwala.com">Arpit Agarwala</a> · <a href="https://github.com/arpitagarwala/hindu-panchang">AGPL source</a></footer></html>`;
}
