"use client";
import { useState } from "react";
import type { JyotishReport } from "@/lib/jyotish/types";
import { associations, planetHi, signHi } from "@/lib/jyotish/knowledge";
import { gemstoneShortlist } from "@/lib/jyotish/gemstones";
import s from "./Jyotish.module.css";
export default function GemstoneGuide({
  report,
  hi,
}: {
  report: JyotishReport;
  hi: boolean;
}) {
  const [ratti, setRatti] = useState(""),
    list = gemstoneShortlist(report),
    lang = hi ? "hi" : "en";
  const t = (en: string, hindi: string) => (hi ? hindi : en);
  return (
    <section
      className={s.card}
      aria-label={t("Your gemstone shortlist", "आपके चुने हुए रत्न")}
    >
      <h2>{t("Your gemstone shortlist", "आपके लिए चुने हुए रत्न")}</h2>
      <p>
        {t("For your", "आपके")}{" "}
        <strong>
          {hi
            ? signHi[report.chart.ascendant.sign - 1]
            : report.chart.ascendant.signName}
        </strong>{" "}
        {t(
          "ascendant, selected using a traditional Jyotish method.",
          "लग्न के लिए पारंपरिक ज्योतिष विधि से चुने गए विकल्प।",
        )}
      </p>
      {list.uncertain ? (
        <p className={s.notice}>
          {t(
            "Your birth-time uncertainty changes the D1 chart. Confirm your birth time before choosing a gemstone; a reliable shortlist is not available yet.",
            "जन्म समय की अनिश्चितता से D1 कुंडली बदलती है। रत्न चुनने से पहले जन्म समय की पुष्टि करें; अभी भरोसेमंद सूची उपलब्ध नहीं है।",
          )}
        </p>
      ) : (
        <>
          <h3>
            {t("Recommended for your chart", "आपकी कुंडली के लिए अनुशंसित")}
          </h3>
          <p className={s.muted}>
            {t(
              "These are alternatives. Start with the best match; do not assume you should wear every stone together.",
              "ये अलग-अलग विकल्प हैं। सबसे उपयुक्त विकल्प से शुरू करें; सभी रत्न एक साथ पहनना आवश्यक नहीं है।",
            )}
          </p>
          <div className={s.gemGrid}>
            {list.recommended.map((pick, i) => {
              const a = associations[pick.planet];
              return (
                <article className={s.gemPick} key={pick.planet}>
                  <span className={s.pill}>
                    {i === 0
                      ? t("Best match", "सबसे उपयुक्त विकल्प")
                      : t("Alternative", "अन्य विकल्प")}
                  </span>
                  <h3>{a.stone[lang]}</h3>
                  <p className={s.muted}>
                    {hi ? planetHi[pick.planet] : pick.planet}
                  </p>
                  <p>{pick.reason[lang]}</p>
                  <dl className={s.gemFacts}>
                    {[
                      [t("Finger", "उँगली"), a.finger[lang]],
                      [t("Metal", "धातु"), a.metal[lang]],
                      [t("Weekday", "वार"), a.day[lang]],
                      [
                        t("Traditional purpose", "पारंपरिक उद्देश्य"),
                        a.purpose[lang],
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {pick.note ? (
                    <p className={s.muted}>{pick.note[lang]}</p>
                  ) : null}
                  <details>
                    <summary>{t("Why this stone?", "यह रत्न क्यों?")}</summary>
                    <p>{pick.context[lang]}</p>
                  </details>
                </article>
              );
            })}
          </div>
          <h3 className={s.gemHeading}>
            {t(
              "Not recommended for your chart",
              "आपकी कुंडली के लिए अनुशंसित नहीं",
            )}
          </h3>
          <div className={s.gemGrid}>
            {list.avoid.map((pick) => (
              <article
                className={`${s.gemPick} ${s.gemAvoid}`}
                key={pick.planet}
              >
                <span className={s.pill}>
                  {t(
                    "Avoid as an automatic remedy",
                    "अपने-आप उपाय के रूप में न पहनें",
                  )}
                </span>
                <h3>{associations[pick.planet].stone[lang]}</h3>
                <p>{pick.reason[lang]}</p>
                <details>
                  <summary>{t("Why avoid it?", "इससे क्यों बचें?")}</summary>
                  <p>{pick.context[lang]}</p>
                </details>
              </article>
            ))}
          </div>
        </>
      )}
      <p className={s.muted}>
        {t(
          "Traditional recommendations are not proven benefits or proof that a stone will harm you. Confirm suitability and weight before buying; finger and metal customs vary.",
          "पारंपरिक सलाह लाभ का प्रमाण या किसी रत्न से हानि का प्रमाण नहीं है। खरीदने से पहले उपयुक्तता और वजन की पुष्टि करें; उँगली और धातु की परंपराएँ भिन्न हैं।",
        )}
      </p>
      <details>
        <summary>
          {t("How these stones were selected", "ये रत्न कैसे चुने गए")}
        </summary>
        <p>
          {t(
            "The shortlist uses the favourable and unfavourable planets for your birth ascendant in P.V.R. Narasimha Rao’s classification. Yogakaraka and ascendant/trine rulers lead the recommendations; the active dasha only breaks close rankings. Neutral planets, Rahu and Ketu are omitted. This is one school’s approach, not a universal prescription.",
            "यह सूची पी.वी.आर. नरसिम्हा राव की वर्गीकरण विधि में आपके जन्म लग्न के अनुकूल और प्रतिकूल ग्रहों से बनती है। योगकारक तथा लग्न/त्रिकोण स्वामी को प्राथमिकता है; चालू दशा केवल निकट विकल्पों के क्रम में सहायक है। तटस्थ ग्रह, राहु और केतु शामिल नहीं हैं। यह एक परंपरा की विधि है, सार्वभौमिक निर्देश नहीं।",
          )}
        </p>
        <a
          href="https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf#page=178"
          target="_blank"
          rel="noreferrer"
        >
          {t(
            "Method reference · sections 13.2 and 34.2",
            "विधि संदर्भ · खंड 13.2 और 34.2",
          )}
        </a>
      </details>
      <details>
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
            "1 jewellery ratti ≈ 0.182 g ≈ 0.91 ct. Standards vary; verify certified carat weight. The chart does not calculate a recommended ratti dose.",
            "1 ज्वेलरी रत्ती ≈ 0.182 ग्राम ≈ 0.91 कैरेट। मान भिन्न हैं; प्रमाणित कैरेट जाँचें। कुंडली से अनुशंसित रत्ती की मात्रा तय नहीं होती।",
          )}
        </p>
      </details>
    </section>
  );
}
