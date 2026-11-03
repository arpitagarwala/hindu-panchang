"use client";
import { useState } from "react";
import type { JyotishReport, Text } from "@/lib/jyotish/types";
import type { VargaType } from "@/lib/astronomy/vargas";
import { ZODIAC_SIGNS } from "@/lib/astronomy/constants";
import {
  associations,
  planetHi,
  signHi,
  practices,
  nakshatraHi,
} from "@/lib/jyotish/knowledge";
import DivisionalChart from "./DivisionalChart";
import s from "./Jyotish.module.css";
export type Tab =
  | "reading"
  | "charts"
  | "periods"
  | "outlook"
  | "daily"
  | "guidance"
  | "gems";
const chartHi: Record<VargaType, string> = {
  D1: "राशि · मूल जन्म कुंडली",
  D2: "होरा · संसाधन",
  D3: "द्रेष्काण · प्रयास और सहोदर",
  D4: "चतुर्थांश · घर और संपत्ति",
  D7: "सप्तमांश · सृजन और संतान",
  D9: "नवांश · धर्म और संबंध",
  D10: "दशमांश · पेशा",
  D12: "द्वादशांश · वंश और माता-पिता",
  D16: "षोडशांश · सुख-सुविधा",
  D20: "विंशांश · आध्यात्मिक अभ्यास",
  D24: "चतुर्विंशांश · अध्ययन",
  D27: "सप्तविंशांश · सामर्थ्य",
  D30: "त्रिंशांश · चुनौतियाँ",
  D60: "षष्ट्यंश · सूक्ष्म अध्ययन",
};
export default function ReportPanels({
  report,
  hi,
  tab,
}: {
  report: JyotishReport;
  hi: boolean;
  tab: Tab;
}) {
  const [varga, setVarga] = useState<VargaType>("D1"),
    [style, setStyle] = useState<"north" | "south">("north"),
    [ratti, setRatti] = useState("");
  const t = (a: string, b: string) => (hi ? b : a),
    tx = (v: Text) => v[hi ? "hi" : "en"],
    planet = (id: string) => (hi ? planetHi[id] || id : id),
    sign = (n: number) => (hi ? signHi[n - 1] : ZODIAC_SIGNS[n - 1].name);
  const date = (iso: string, time = false) =>
    new Date(iso).toLocaleString(hi ? "hi-IN" : "en-IN", {
      timeZone: report.input.residence.timeZone,
      dateStyle: "medium",
      ...(time
        ? { timeStyle: "short" as const, hourCycle: "h23" as const }
        : {}),
    });
  if (tab === "reading")
    return (
      <>
        <section className={s.card}>
          <h2>
            {t("The chapter you are exploring", "आपके जीवन का वर्तमान अध्याय")}
          </h2>
          <p>
            {t("Vimshottari period", "विंशोत्तरी दशा")}:{" "}
            <strong>
              {planet(report.dasha.current.mahadasha.planet)} /{" "}
              {planet(report.dasha.current.antardasha.planet)} /{" "}
              {planet(report.dasha.current.pratyantardasha.planet)}
            </strong>
          </p>
          <p>
            {t("Sub-period ends", "अंतरदशा समाप्ति")}:{" "}
            {date(report.dasha.current.antardasha.endDate)}
          </p>
          <p className={s.notice}>
            {t(
              "These are traditional themes, not promises of marriage, money, illness or other events. Use the guidance for reflection and everyday planning.",
              "ये पारंपरिक विषय हैं; विवाह, धन, बीमारी या अन्य घटना का वादा नहीं। मनन और रोज़मर्रा की योजना में उपयोग करें।",
            )}
          </p>
        </section>
        <div className={s.grid}>
          {report.readings.map((r, i) => (
            <article className={s.card} key={i}>
              <h3>{tx(r.title)}</h3>
              <p>{tx(r.body)}</p>
              <p className={s.support}>{tx(r.action)}</p>
              <details>
                <summary>
                  {t("Why this reading?", "यह व्याख्या क्यों?")}
                </summary>
                <p>{tx(r.reason)}</p>
                <p>{tx(r.caution)}</p>
              </details>
            </article>
          ))}
        </div>
      </>
    );
  if (tab === "charts")
    return (
      <section className={s.card}>
        <div className={s.chartHeading}>
          <h2>{t("Your divisional charts", "आपकी वर्ग कुंडलियाँ")}</h2>
          <label>
            {t("Choose chart", "कुंडली चुनें")}
            <select
              value={varga}
              onChange={(e) => setVarga(e.target.value as VargaType)}
            >
              {Object.values(report.vargas).map((v) => (
                <option key={v.varga} value={v.varga}>
                  {v.varga} · {hi ? chartHi[v.varga] : v.meta.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h3>
          {hi ? chartHi[varga] : `${varga} · ${report.vargas[varga].meta.name}`}
        </h3>
        <p>
          {hi
            ? "पारंपरिक अध्ययन का क्षेत्र"
            : report.vargas[varga].meta.signification}
        </p>
        {varga !== "D1" ? (
          <p className={s.muted}>
            {t(
              "Divisional charts refine a traditional reading; they do not independently determine events. Degrees below belong to D1, not the divisional sign.",
              "वर्ग कुंडलियाँ पारंपरिक अध्ययन का विस्तार हैं, अकेले घटनाएँ तय नहीं करतीं। नीचे अंश D1 के हैं, वर्ग राशि के नहीं।",
            )}
          </p>
        ) : null}
        <p className={s.notice}>
          {report.sensitivity.find((x) => x.varga === varga)?.changed
            ? t(
                `Placements change when the recorded time shifts by ±${report.input.uncertaintyMinutes} minutes. Interpret this chart with care.`,
                `समय ±${report.input.uncertaintyMinutes} मिनट बदलने पर ग्रह या लग्न की वर्ग राशि बदलती है। सावधानी से पढ़ें।`,
              )
            : t(
                `No placement change detected at ±${report.input.uncertaintyMinutes} minute endpoints. This is not a guarantee of birth-time accuracy.`,
                `±${report.input.uncertaintyMinutes} मिनट के सीमा बिंदुओं पर बदलाव नहीं मिला। यह जन्म समय की शुद्धता की गारंटी नहीं।`,
              )}
        </p>
        <DivisionalChart
          chart={report.vargas[varga]}
          hi={hi}
          style={style}
          onStyle={setStyle}
        />
        <div className={s.scroll}>
          <table className={s.chartTable}>
            <caption>
              {t("Accessible chart placements", "कुंडली की पूर्ण ग्रह स्थिति")}{" "}
              · {varga}
            </caption>
            <thead>
              <tr>
                <th>{t("Graha", "ग्रह")}</th>
                <th>{t("Sign", "राशि")}</th>
                <th>{t("House", "भाव")}</th>
                <th>{t("D1 degree / nakshatra", "D1 अंश / नक्षत्र")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Ascendant", "लग्न")}</td>
                <td>{sign(report.vargas[varga].ascendantSign)}</td>
                <td>1</td>
                <td>
                  {report.chart.ascendant.dms}
                  <small>
                    {hi
                      ? nakshatraHi[report.chart.ascendant.nakshatra - 1]
                      : report.chart.ascendant.nakshatraName}
                  </small>
                </td>
              </tr>
              {Object.values(report.vargas[varga].placements).map((p) => (
                <tr key={p.id}>
                  <td>
                    {planet(p.id)}
                    {report.chart.planets[p.id].isRetrograde ? " ℞" : ""}
                    <small>
                      {report.chart.planets[p.id].isCombust
                        ? t("Combust (traditional orb)", "अस्त (पारंपरिक सीमा)")
                        : ""}
                    </small>
                  </td>
                  <td>{sign(p.sign)}</td>
                  <td>{p.house}</td>
                  <td>
                    {report.chart.planets[p.id].dms}
                    <small>
                      {hi
                        ? nakshatraHi[report.chart.planets[p.id].nakshatra - 1]
                        : report.chart.planets[p.id].nakshatraName}{" "}
                      · {report.chart.planets[p.id].pada}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.muted}>
          {t(
            "D2 uses the Sun/Moon Parashari Hora. D60 counts from the natal sign. Other schools can use different varga methods. ℞ indicates retrograde motion.",
            "D2 में सूर्य-चंद्र पाराशरी होरा है। D60 की गिनती जन्म राशि से है। अन्य परंपराओं की विधि भिन्न हो सकती है। ℞ वक्री गति है।",
          )}
        </p>
      </section>
    );
  if (tab === "periods")
    return (
      <section className={s.card}>
        <h2>{t("Your planetary timeline", "आपकी ग्रह दशा समयरेखा")}</h2>
        <p>
          {t(
            "Vimshottari starts from the birth Moon’s nakshatra. Period dates are calculated; their interpretation is traditional.",
            "विंशोत्तरी जन्म चंद्र के नक्षत्र से शुरू होती है। दशा की तिथियाँ गणितीय हैं; व्याख्या पारंपरिक है।",
          )}
        </p>
        <p>
          {t(
            "Starting lord / balance at birth",
            "प्रारंभिक स्वामी / जन्म पर शेष",
          )}
          : {planet(report.dasha.startingLord)} · {report.dasha.balanceYears}{" "}
          {t("years", "वर्ष")}
        </p>
        {report.dasha.periods.map((md, i) => (
          <details
            key={i}
            open={
              report.input.targetDate >= md.startDate.slice(0, 10) &&
              report.input.targetDate < md.endDate.slice(0, 10)
            }
          >
            <summary>
              {planet(md.planet)} · {date(md.startDate)} → {date(md.endDate)}
            </summary>
            <div className={s.scroll}>
              <table>
                <thead>
                  <tr>
                    <th>{t("Antardasha", "अंतरदशा")}</th>
                    <th>{t("Begins", "आरंभ")}</th>
                    <th>{t("Ends", "समाप्ति")}</th>
                  </tr>
                </thead>
                <tbody>
                  {md.subPeriods?.map((ad, j) => (
                    <tr key={j}>
                      <td>
                        {planet(md.planet)} / {planet(ad.planet)}
                      </td>
                      <td>{date(ad.startDate, true)}</td>
                      <td>{date(ad.endDate, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
        <p className={s.muted}>
          {t(
            "Year length: 365.242199 days. Different dasha-year conventions can shift dates. Dates use the selected current-place time zone.",
            "वर्ष की अवधि: 365.242199 दिन। अन्य दशा-वर्ष विधि से तिथियाँ बदल सकती हैं। तिथियाँ चुने वर्तमान स्थान के समय क्षेत्र में हैं।",
          )}
        </p>
      </section>
    );
  if (tab === "outlook")
    return (
      <section className={s.card}>
        <h2>
          {t("The next 12 months, thoughtfully", "अगले 12 महीने, विचार के साथ")}
        </h2>
        <p>
          {t(
            "Each row is a noon snapshot on its listed date, not a verdict on the entire month. It combines your dasha with Jupiter, Saturn and Mercury counted from your natal Moon.",
            "प्रत्येक पंक्ति दी गई तिथि की दोपहर की झलक है, पूरे महीने का निर्णय नहीं। इसमें दशा और जन्म चंद्र से गुरु, शनि और बुध के गोचर हैं।",
          )}
        </p>
        <div className={s.scroll}>
          <table className={s.forecast}>
            <thead>
              <tr>
                <th>{t("Snapshot date", "झलक की तिथि")}</th>
                <th>{t("Dasha focus", "दशा का ध्यान")}</th>
                <th>{t("Jupiter · learning", "गुरु · अध्ययन")}</th>
                <th>{t("Saturn · commitments", "शनि · जिम्मेदारी")}</th>
                <th>{t("Mercury · communication", "बुध · संवाद")}</th>
              </tr>
            </thead>
            <tbody>
              {report.forecast.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>
                    {planet(row.mahadasha)} / {planet(row.antardasha)}
                  </td>
                  {row.transits.map((v) => (
                    <td key={v.planet}>
                      <span className={v.supportive ? s.support : s.caution}>
                        {v.supportive
                          ? t("Supportive tradition", "पारंपरिक समर्थन")
                          : t("Proceed thoughtfully", "विचारपूर्वक आगे बढ़ें")}
                      </span>
                      <small>
                        {sign(v.sign)} · {t("from Moon", "चंद्र से")}{" "}
                        {v.houseFromMoon}
                        {v.retrograde ? " ℞" : ""}
                      </small>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details>
          <summary>
            {t("How these themes are assigned", "ये विषय कैसे तय होते हैं")}
          </summary>
          <p>
            {t(
              "Common Moon-sign gochara sets: Jupiter 2/5/7/9/11; Saturn 3/6/11; Mercury 2/4/6/8/10/11. This simplified rule does not include vedha, aspects or a complete transit synthesis. It cannot identify a guaranteed good or bad month.",
              "प्रचलित चंद्र-गोचर भाव: गुरु 2/5/7/9/11; शनि 3/6/11; बुध 2/4/6/8/10/11। इस सरल नियम में वेध, दृष्टि या पूर्ण गोचर संश्लेषण नहीं है। इससे अच्छा या बुरा महीना सुनिश्चित नहीं होता।",
            )}
          </p>
        </details>
      </section>
    );
  if (tab === "daily")
    return (
      <section className={s.card}>
        <h2>{t("Plan your day", "अपने दिन की योजना बनाएँ")}</h2>
        <p>
          {report.day.date} · {report.day.place} · {report.day.timeZone}
        </p>
        <div className={s.stats}>
          <div>
            <span>{t("Sunrise", "सूर्योदय")}</span>
            <strong>
              {report.day.sunrise ? date(report.day.sunrise, true) : "—"}
            </strong>
          </div>
          <div>
            <span>
              {report.day.sunrise
                ? t("Tara bala at sunrise", "सूर्योदय पर ताराबल")
                : t("Tara bala at local noon", "स्थानीय दोपहर पर ताराबल")}
            </span>
            <strong>{tx(report.day.taraName)}</strong>
            <span>
              {report.day.taraSupportive
                ? t("Traditionally supportive", "पारंपरिक रूप से अनुकूल")
                : t("Traditionally calls for care", "पारंपरिक सावधानी")}
            </span>
          </div>
          <div>
            <span>{t("Chandra bala at noon", "दोपहर पर चंद्रबल")}</span>
            <strong>{report.day.chandraHouse}</strong>
            <span>
              {report.day.chandraSupportive
                ? t("Supportive Moon-house group", "अनुकूल चंद्र भाव समूह")
                : t("Reflective Moon-house group", "मनन का चंद्र भाव समूह")}
            </span>
          </div>
        </div>
        <div className={s.scroll}>
          <table>
            <thead>
              <tr>
                <th>{t("Traditional window", "पारंपरिक समय")}</th>
                <th>{t("Begins", "आरंभ")}</th>
                <th>{t("Ends", "समाप्ति")}</th>
                <th>{t("Use", "उपयोग")}</th>
              </tr>
            </thead>
            <tbody>
              {report.day.windows.map((w) => (
                <tr key={w.name.en}>
                  <td>{tx(w.name)}</td>
                  <td>{date(w.start, true)}</td>
                  <td>{date(w.end, true)}</td>
                  <td className={w.kind === "support" ? s.support : s.caution}>
                    {w.kind === "support"
                      ? t("Reflection / planning", "मनन / योजना")
                      : t(
                          "Traditionally avoid new starts",
                          "परंपरा अनुसार नए आरंभ टालें",
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!report.day.windows.length ? (
          <p className={s.notice}>
            {t(
              "Solar windows are unavailable for this polar date. No substitute timings are invented.",
              "इस ध्रुवीय तिथि पर सौर समय उपलब्ध नहीं। वैकल्पिक समय गढ़े नहीं गए हैं।",
            )}
          </p>
        ) : null}
        <p className={s.muted}>
          {t(
            "These solar windows are shared local Panchang timings, not personalised guarantees. Caution windows may overlap supportive ones; inspect both. Tara/Chandra bala alone is not a complete muhurta selection. Normal responsibilities and urgent care should not wait for an auspicious time.",
            "ये स्थानीय पंचांग के साझा सौर समय हैं, व्यक्तिगत गारंटी नहीं। शुभ और सावधानी के समय मिल सकते हैं; दोनों जाँचें। ताराबल/चंद्रबल अकेले पूर्ण मुहूर्त चयन नहीं। सामान्य जिम्मेदारियाँ और तत्काल सहायता शुभ समय के लिए न टालें।",
          )}
        </p>
      </section>
    );
  if (tab === "guidance") {
    const a = associations[report.chart.ascendant.signLord];
    return (
      <>
        <section className={s.card}>
          <h2>{t("Your personal guide", "आपका व्यक्तिगत मार्गदर्शन")}</h2>
          <p>
            {t(
              "The colour, weekday and direction follow your ascendant lord",
              "रंग, वार और दिशा आपके लग्न स्वामी से जुड़े हैं",
            )}
            : <strong>{planet(report.chart.ascendant.signLord)}</strong>.
          </p>
          <div className={s.stats}>
            {[
              [t("Colour to explore", "अपनाने का रंग"), tx(a.color)],
              [t("Traditional weekday", "पारंपरिक वार"), tx(a.day)],
              [t("Symbolic direction", "प्रतीकात्मक दिशा"), tx(a.direction)],
              [
                t("Birth number · numerology", "मूलांक · अंकशास्त्र"),
                report.numerology.birth,
              ],
              [
                t("Destiny number · numerology", "भाग्यांक · अंकशास्त्र"),
                report.numerology.destiny,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className={s.notice}>
            {t(
              "These are symbolic “lucky” associations, not measured advantages. There is no evidence-based unlucky colour, forbidden outfit or harmful direction for your chart. Wear what is comfortable; choose directions for practical needs. Numbers use digit sums of the birth day and full date, not planetary calculation.",
              "ये प्रतीकात्मक “शुभ” संबंध हैं, मापे गए लाभ नहीं। कुंडली से कोई रंग, कपड़ा या दिशा हानिकारक सिद्ध नहीं होती। सुविधाजनक वस्त्र और व्यावहारिक दिशा चुनें। अंक जन्म के दिन और पूर्ण तिथि के अंकों का योग हैं, ग्रह गणना नहीं।",
            )}
          </p>
        </section>
        <div className={s.grid}>
          <article className={s.card}>
            <h3>{t("Make room for", "इनके लिए समय बनाएँ")}</h3>
            <p>{tx(practices[report.chart.ascendant.signLord])}</p>
            <p>{tx(practices[report.dasha.current.antardasha.planet])}</p>
          </article>
          <article className={s.card}>
            <h3>{t("Take care with", "इनमें सावधानी रखें")}</h3>
            <p>
              {t(
                "Avoid rushed commitments, fatalistic thinking and purchases made out of fear. A difficult traditional theme does not mean something bad will happen.",
                "जल्दबाजी के वादे, भाग्यवाद और डर से की गई खरीदारी से बचें। कठिन पारंपरिक विषय का अर्थ बुरी घटना होना नहीं है।",
              )}
            </p>
          </article>
          <article className={s.card}>
            <h3>{t("A simple free practice", "एक सरल निःशुल्क अभ्यास")}</h3>
            <p>
              {t(
                "Choose five quiet minutes for reflection, keep a short journal, and offer help within your means. Rituals can express your faith without costly remedies.",
                "पाँच शांत मिनट मनन करें, छोटी डायरी रखें और सामर्थ्य अनुसार मदद करें। महंगे उपायों के बिना भी आस्था व्यक्त हो सकती है।",
              )}
            </p>
          </article>
        </div>
      </>
    );
  }
  return (
    <section className={s.card}>
      <h2>{t("Gemstones, with context", "रत्न, सही संदर्भ में")}</h2>
      <p>
        {t(
          "Explore traditional associations and the house ownership behind them. This is not a recommendation to buy or wear a stone. Different schools disagree about suitability, finger, metal and rituals.",
          "पारंपरिक संबंध और भाव स्वामित्व देखें। यह रत्न खरीदने या पहनने की सलाह नहीं। उपयुक्तता, उँगली, धातु और विधि पर परंपराओं में मतभेद हैं।",
        )}
      </p>
      <p className={s.notice}>
        {t(
          "A birth chart cannot establish an effective gemstone dose or guarantee an outcome. This app does not auto-prescribe a ratti weight, blue sapphire, hessonite or cat’s eye. Do not replace medical care or financial planning with gemstones.",
          "कुंडली से रत्न की प्रभावी मात्रा या परिणाम सुनिश्चित नहीं होता। ऐप अपने-आप रत्ती, नीलम, गोमेद या लहसुनिया पहनने का निर्देश नहीं देता। रत्न से चिकित्सा या आर्थिक योजना की जगह न लें।",
        )}
      </p>
      <div className={s.scroll}>
        <table className={s.forecast}>
          <thead>
            <tr>
              <th>{t("Graha / stone", "ग्रह / रत्न")}</th>
              <th>{t("Birth-chart context", "जन्म कुंडली का संदर्भ")}</th>
              <th>{t("Finger / metal", "उँगली / धातु")}</th>
              <th>{t("Weekday / symbolism", "वार / प्रतीक")}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(associations).map(([id, a]) => {
              const owned = report.chart.houses
                  .filter((h) => h.signLord === id)
                  .map((h) => h.house),
                mixed = owned.some((h) => [6, 8, 12].includes(h)),
                trine = owned.some((h) => [1, 5, 9].includes(h));
              return (
                <tr key={id}>
                  <td>
                    <strong>{tx(a.stone)}</strong>
                    <small>{planet(id)}</small>
                  </td>
                  <td>
                    {owned.length
                      ? `${t("Rules houses", "भाव स्वामी")} ${owned.join(", ")}`
                      : t(
                          "No sign ownership in this model",
                          "इस विधि में राशि स्वामित्व नहीं",
                        )}
                    <small
                      className={mixed || !owned.length ? s.caution : s.support}
                    >
                      {mixed
                        ? t(
                            "Mixed ownership · avoid automatic strengthening",
                            "मिश्रित स्वामित्व · स्वतः सुदृढ़ न करें",
                          )
                        : trine
                          ? t(
                              "Ascendant / trine association · requires full review",
                              "लग्न / त्रिकोण संबंध · पूर्ण समीक्षा आवश्यक",
                            )
                          : t(
                              "No automatic suitability established",
                              "स्वतः उपयुक्तता स्थापित नहीं",
                            )}
                    </small>
                  </td>
                  <td>
                    {tx(a.finger)}
                    <small>{tx(a.metal)}</small>
                  </td>
                  <td>
                    {tx(a.day)}
                    <small>{tx(a.purpose)}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <details open>
        <summary>{t("Ratti weight converter", "रत्ती वजन परिवर्तक")}</summary>
        <label className={s.field}>
          {t(
            "Weight in jewellery ratti (conversion only)",
            "ज्वेलरी रत्ती में वजन (केवल रूपांतरण)",
          )}
          <input
            className={s.weight}
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={ratti}
            onChange={(e) => setRatti(e.target.value)}
          />
        </label>
        <p>
          {Number(ratti) > 0 && Number(ratti) <= 100
            ? `${ratti} ${t("ratti", "रत्ती")} ≈ ${(Number(ratti) * 0.182).toFixed(3)} g ≈ ${(Number(ratti) * 0.91).toFixed(2)} ct`
            : "—"}
        </p>
        <p className={s.muted}>
          {t(
            "Illustrative jewellery convention: 1 ratti ≈ 0.182 g (0.91 carat). Ratti standards vary; verify the seller’s conversion and certified carat weight. The input is not a recommended dose or a body-weight formula.",
            "उदाहरण ज्वेलरी मान: 1 रत्ती ≈ 0.182 ग्राम (0.91 कैरेट)। रत्ती के मान भिन्न हैं; विक्रेता का रूपांतरण और प्रमाणित कैरेट जाँचें। यह अनुशंसित मात्रा या शरीर के वजन का सूत्र नहीं।",
          )}
        </p>
      </details>
      <h3>{t("What to avoid", "किनसे बचें")}</h3>
      <p>
        {t(
          "Avoid choosing a stone solely because a planet is weak, a dasha is active, or an automated list calls it lucky. This simplified house-ownership screen does not establish which stone you must wear or must never wear.",
          "केवल कमजोर ग्रह, चालू दशा या स्वचालित “शुभ” सूची से रत्न न चुनें। यह सरल भाव स्वामित्व जाँच तय नहीं करती कि कौन सा रत्न अवश्य पहनें या कभी न पहनें।",
        )}
      </p>
    </section>
  );
}
