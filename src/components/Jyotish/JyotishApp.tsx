"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  Sparkles,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import BirthForm from "./BirthForm";
import ReportPanels, { type Tab } from "./ReportPanels";
import type { BirthInput, JyotishReport } from "@/lib/jyotish/types";
import { planetHi, signHi, nakshatraHi } from "@/lib/jyotish/knowledge";
import { ZODIAC_SIGNS } from "@/lib/astronomy/constants";
import { reportHtml } from "@/lib/jyotish/export";
import s from "./Jyotish.module.css";
const STORAGE = "jyotish.reports.v1";
const initial: BirthInput = {
  name: "",
  date: "",
  time: "",
  place: "New Delhi, Delhi, India",
  latitude: 28.6139,
  longitude: 77.209,
  timeZone: "Asia/Kolkata",
  overlap: "reject",
  uncertaintyMinutes: 5,
  node: "mean",
  targetDate: "",
  residence: {
    place: "New Delhi, Delhi, India",
    latitude: 28.6139,
    longitude: 77.209,
    timeZone: "Asia/Kolkata",
  },
};
function readSaved(): JyotishReport[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(v)
      ? v
          .filter(
            (r) =>
              r?.version === 1 &&
              r.chart?.planets?.Moon &&
              r.input?.residence &&
              r.dasha?.current &&
              Array.isArray(r.forecast) &&
              Array.isArray(r.readings) &&
              r.vargas?.D1,
          )
          .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}
function profileKey(input: BirthInput) {
  return JSON.stringify([
    input.name,
    input.date,
    input.time,
    input.latitude,
    input.longitude,
    input.timeZone,
    input.node,
  ]);
}
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export default function JyotishApp() {
  const [hi, setHi] = useState(false),
    [input, setInput] = useState(initial),
    [report, setReport] = useState<JyotishReport | null>(null),
    [saved, setSaved] = useState<JyotishReport[]>([]),
    [remember, setRemember] = useState(false),
    [editing, setEditing] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [tab, setTab] = useState<Tab>("reading");
  const request = useRef<AbortController | null>(null),
    heading = useRef<HTMLDivElement | null>(null);
  const t = (en: string, hindi: string) => (hi ? hindi : en),
    planet = (id: string) => (hi ? planetHi[id] || id : id),
    sign = (n: number) => (hi ? signHi[n - 1] : ZODIAC_SIGNS[n - 1].name);
  // Browser-local private profiles are deliberately read after hydration so
  // neither personal data nor the host's date is rendered into public HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readSaved());
    setInput((v) => ({ ...v, targetDate: today() }));
    try {
      const lang = localStorage.getItem("jyotish_lang");
      setHi(
        lang
          ? lang === "hi"
          : JSON.parse(localStorage.getItem("panchang.preferences.v1") || "{}")
              .language === "hi",
      );
    } catch {}
    return () => request.current?.abort();
  }, []);
  function language() {
    setHi((v) => !v);
    try {
      localStorage.setItem("jyotish_lang", hi ? "en" : "hi");
    } catch {}
  }
  function saveReport(r: JyotishReport) {
    const next = [
      r,
      ...readSaved().filter((x) => profileKey(x.input) !== profileKey(r.input)),
    ].slice(0, 3);
    localStorage.setItem(STORAGE, JSON.stringify(next));
    setSaved(next);
  }
  async function generate() {
    setBusy(true);
    setError("");
    setStatus("");
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const cached = readSaved().find(
        (r) => JSON.stringify(r.input) === JSON.stringify(input),
      );
      let next = cached;
      if (!next) {
        const response = await fetch("/api/jyotish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error ||
              t("Could not calculate this report.", "पाठ की गणना नहीं हो सकी।"),
          );
        next = data as JyotishReport;
      }
      if (controller.signal.aborted) return;
      setReport(next);
      setEditing(false);
      setTab("reading");
      if (remember)
        try {
          saveReport(next);
          setStatus(
            t(
              "Report saved on this device. Download the HTML copy to read it without internet.",
              "पाठ इस उपकरण पर सहेजा गया। बिना इंटरनेट पढ़ने के लिए HTML प्रति डाउनलोड करें।",
            ),
          );
        } catch {
          setStatus(
            t(
              "Report generated, but device storage is full or unavailable. Download a copy instead.",
              "पाठ बन गया, पर उपकरण का संग्रह उपलब्ध नहीं। प्रति डाउनलोड करें।",
            ),
          );
        }
      setTimeout(() => heading.current?.focus(), 0);
    } catch (e) {
      if (controller.signal.aborted)
        setError(
          t(
            "Request cancelled or timed out. Your saved reports are unchanged.",
            "अनुरोध रद्द हुआ या समय समाप्त। सहेजे पाठ सुरक्षित हैं।",
          ),
        );
      else
        setError(
          e instanceof Error
            ? e.message
            : t(
                "Reconnect and try again.",
                "इंटरनेट से जुड़कर फिर प्रयास करें।",
              ),
        );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
        new Blob([reportHtml(report, hi)], { type: "text/html;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `kundali-${report.input.date}-${hi ? "hi" : "en"}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function clear() {
    if (
      !confirm(
        t(
          "Delete all saved Kundali reports and old birth profiles from this device?",
          "इस उपकरण से सभी सहेजी कुंडलियाँ और पुराने जन्म विवरण हटाएँ?",
        ),
      )
    )
      return;
    try {
      localStorage.removeItem(STORAGE);
      localStorage.removeItem("jyotish_user_birth");
      setSaved([]);
      setReport(null);
      setInput({ ...initial, targetDate: today() });
      setEditing(true);
      setStatus(
        t(
          "Saved reports removed. Previously downloaded files must be deleted separately.",
          "सहेजे पाठ हटा दिए गए। डाउनलोड की हुई फाइल अलग से हटाएँ।",
        ),
      );
    } catch {
      setError(
        t("Could not clear device storage.", "उपकरण का संग्रह नहीं हट सका।"),
      );
    }
  }
  const tabs: [Tab, string, string][] = [
    ["reading", "My reading", "मेरा पाठ"],
    ["charts", "Birth charts", "जन्म कुंडलियाँ"],
    ["periods", "Dasha timeline", "दशा समयरेखा"],
    ["outlook", "12-month outlook", "12 महीने की झलक"],
    ["daily", "Daily timings", "दैनिक समय"],
    ["guidance", "Personal guide", "व्यक्तिगत मार्गदर्शन"],
    ["gems", "Gemstone guide", "रत्न संदर्भ"],
  ];
  return (
    <div className={s.app} lang={hi ? "hi" : "en"}>
      <header className={s.header}>
        <Link href="/" className={s.brand}>
          ☼ {t("Panchang", "पंचांग")}
        </Link>
        <div className={s.inline}>
          <Link href="/">
            <ArrowLeft size={15} style={{ display: "inline" }} />{" "}
            {t("Daily Panchang", "दैनिक पंचांग")}
          </Link>
          <button
            onClick={language}
            aria-label={t("Read in Hindi", "अंग्रेज़ी में पढ़ें")}
          >
            {hi ? "English" : "हिन्दी"}
          </button>
        </div>
      </header>
      <main className={s.wrap}>
        <div className={s.hero}>
          <span className={s.eyebrow}>
            {t(
              "Your personal Jyotish companion",
              "आपका व्यक्तिगत ज्योतिष साथी",
            )}
          </span>
          <h1>
            {t(
              "A clearer view of your Kundali.",
              "अपनी कुंडली को सरलता से समझें।",
            )}
          </h1>
          <p>
            {t(
              "Explore your birth charts, planetary periods and traditional guidance, with the meaning behind every reading.",
              "जन्म कुंडली, ग्रह दशाएँ और पारंपरिक मार्गदर्शन देखें—हर व्याख्या का आधार समझें।",
            )}
          </p>
          <p className={s.muted}>
            {t(
              "Astrology is a cultural and spiritual tradition; its interpretations are not scientifically reliable predictions. Your choices and circumstances matter.",
              "ज्योतिष सांस्कृतिक और आध्यात्मिक परंपरा है; इसकी व्याख्याएँ वैज्ञानिक रूप से विश्वसनीय भविष्यवाणियाँ नहीं हैं। आपके निर्णय और परिस्थितियाँ महत्वपूर्ण हैं।",
            )}
          </p>
        </div>
        {saved.length ? (
          <section className={`${s.card} ${s.noPrint}`}>
            <div className={s.inline}>
              <ShieldCheck size={20} />
              <strong>
                {t("Saved on this device", "इस उपकरण पर सहेजे गए")}
              </strong>
            </div>
            <div className={s.actions}>
              {saved.map((r, i) => (
                <button
                  key={i}
                  disabled={busy}
                  onClick={() => {
                    setInput(r.input);
                    setReport(r);
                    setEditing(false);
                    setTab("reading");
                    setError("");
                    setStatus(
                      t(
                        "Showing a saved report. Its reading date is shown below.",
                        "सहेजा हुआ पाठ दिख रहा है। इसकी तिथि नीचे है।",
                      ),
                    );
                  }}
                >
                  {r.input.name || t("Profile", "प्रोफाइल")} · {r.input.date}
                </button>
              ))}
              <button onClick={clear} disabled={busy}>
                <Trash2 size={16} />
                {t("Delete saved data", "सहेजा डेटा हटाएँ")}
              </button>
            </div>
          </section>
        ) : null}
        {editing ? (
          <BirthForm
            key={report?.generatedAt || "new"}
            value={input}
            onChange={setInput}
            hi={hi}
            busy={busy}
            onSubmit={generate}
            remember={remember}
            onRemember={setRemember}
          />
        ) : (
          <div className={`${s.actions} ${s.noPrint}`}>
            <button onClick={() => setEditing(true)}>
              {t(
                "Edit birth details / reading date",
                "जन्म विवरण / पाठ की तिथि बदलें",
              )}
            </button>
            <button
              onClick={() => {
                setInput({ ...initial, targetDate: today() });
                setReport(null);
                setEditing(true);
                setRemember(false);
                setError("");
              }}
            >
              {t("New Kundali", "नई कुंडली")}
            </button>
          </div>
        )}
        {busy ? (
          <div className={s.inline}>
            <span role="status">
              {t("Calculating planets and periods…", "ग्रह और दशाओं की गणना…")}
            </span>
            <button onClick={() => request.current?.abort()}>
              {t("Cancel", "रद्द करें")}
            </button>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className={`${s.notice} ${s.error}`}>
            {error}
          </p>
        ) : null}
        <p className={`${s.status} ${s.muted}`} role="status">
          {status}
        </p>
        {report ? (
          <div
            ref={heading}
            tabIndex={-1}
            aria-label={t("Your Kundali report", "आपका कुंडली पाठ")}
          >
            <section className={s.card}>
              <span className={s.eyebrow}>
                {t("Your birth portrait", "आपकी जन्म झलक")}
              </span>
              <h2>{report.input.name || t("Your Kundali", "आपकी कुंडली")}</h2>
              <p>
                {report.input.date} · {report.input.time} · {report.input.place}
              </p>
              <p className={s.muted}>
                {t("Reading for", "पाठ की तिथि")} {report.input.targetDate} ·{" "}
                {t("Timings in", "दैनिक समय का स्थान")}{" "}
                {report.input.residence.place}
              </p>
              <div className={s.stats}>
                <div>
                  <span>{t("Lagna · Ascendant", "लग्न")}</span>
                  <strong>{sign(report.chart.ascendant.sign)}</strong>
                  <span>{report.chart.ascendant.dms}</span>
                </div>
                <div>
                  <span>{t("Moon sign · Rashi", "चंद्र राशि")}</span>
                  <strong>{sign(report.chart.planets.Moon.sign)}</strong>
                  <span>
                    {hi
                      ? nakshatraHi[report.chart.moonNakshatra.number - 1]
                      : report.chart.moonNakshatra.name}{" "}
                    · {t("Pada", "पद")} {report.chart.moonNakshatra.pada}
                  </span>
                </div>
                <div>
                  <span>
                    {t("Current planetary period", "वर्तमान ग्रह दशा")}
                  </span>
                  <strong>
                    {planet(report.dasha.current.mahadasha.planet)}
                  </strong>
                  <span>
                    {planet(report.dasha.current.antardasha.planet)}{" "}
                    {t("sub-period", "अंतरदशा")}
                  </span>
                </div>
              </div>
              <div
                className={`${s.actions} ${s.noPrint}`}
                style={{ marginTop: 20 }}
              >
                <button onClick={download}>
                  <Download size={17} />
                  {t(
                    "Download full offline report",
                    "पूरा ऑफलाइन पाठ डाउनलोड करें",
                  )}
                </button>
                <button onClick={() => window.print()}>
                  <Printer size={17} />
                  {t("Print this section", "यह भाग प्रिंट करें")}
                </button>
                <button
                  onClick={() => {
                    try {
                      saveReport(report);
                      setStatus(
                        t("Saved on this device.", "इस उपकरण पर सहेजा गया।"),
                      );
                    } catch {
                      setError(
                        t(
                          "Storage unavailable. Download the offline report instead.",
                          "संग्रह उपलब्ध नहीं। ऑफलाइन पाठ डाउनलोड करें।",
                        ),
                      );
                    }
                  }}
                >
                  {t("Save on this device", "इस उपकरण पर सहेजें")}
                </button>
              </div>
              <p className={s.muted}>
                {t(
                  "The HTML download includes every chart and section and opens without this website. Saved browser profiles require this page to load.",
                  "HTML डाउनलोड में सभी कुंडलियाँ और भाग हैं; यह वेबसाइट के बिना खुलता है। ब्राउज़र में सहेजी प्रोफाइल खोलने के लिए यह पृष्ठ लोड होना चाहिए।",
                )}
              </p>
            </section>
            <nav
              className={`${s.tabs} ${s.noPrint}`}
              aria-label={t("Report sections", "पाठ के भाग")}
            >
              {tabs.map(([id, en, hindi]) => (
                <button
                  key={id}
                  aria-pressed={tab === id}
                  onClick={() => setTab(id)}
                >
                  {t(en, hindi)}
                </button>
              ))}
            </nav>
            <ReportPanels report={report} hi={hi} tab={tab} />
            <details className={s.card}>
              <summary>
                {t(
                  "Calculation details & reading limits",
                  "गणना विवरण और पाठ की सीमाएँ",
                )}
              </summary>
              <p>
                Swiss Ephemeris 2.10.03 · Lahiri {report.chart.ayanamsaDms} ·{" "}
                {t("Whole-sign houses", "पूर्ण-राशि भाव")} ·{" "}
                {report.input.node === "mean"
                  ? t("Mean nodes", "मध्यम राहु")
                  : t("True nodes", "स्पष्ट राहु")}
              </p>
              <p>
                {t("Birth UTC instant", "जन्म का UTC समय")}:{" "}
                {report.birthInstant} ·{" "}
                {t(
                  "Historical UTC offset in minutes",
                  "ऐतिहासिक UTC अंतर, मिनट",
                )}
                : {report.offsetMinutes}
              </p>
              <p>
                {t(
                  "Birth-time endpoint sensitivity:",
                  "जन्म समय के सीमा बिंदुओं पर संवेदनशीलता:",
                )}{" "}
                ±{report.input.uncertaintyMinutes} {t("minutes", "मिनट")} ·{" "}
                {report.sensitivity
                  .filter((x) => x.changed)
                  .map((x) => x.varga)
                  .join(", ") ||
                  t(
                    "No changed placements detected",
                    "कोई बदली स्थिति नहीं मिली",
                  )}
              </p>
              <p>
                {t(
                  "Only the two uncertainty endpoints are tested; intermediate changes can be missed. High divisions, especially D60, are extremely birth-time sensitive. No birth-time rectification or certainty claim is made.",
                  "केवल अनिश्चितता के दो सीमा बिंदु जाँचे गए हैं; बीच का बदलाव छूट सकता है। उच्च वर्ग, खासकर D60, जन्म समय के प्रति बहुत संवेदनशील हैं। जन्म समय शोधन या निश्चितता का दावा नहीं है।",
                )}
              </p>
              <p>
                {t("Report generated", "पाठ बनाया गया")}:{" "}
                {new Date(report.generatedAt).toLocaleString(
                  hi ? "hi-IN" : "en-IN",
                )}
              </p>
              <p>
                <a
                  href="https://www.astro.com/swisseph/swephprg.htm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Swiss Ephemeris documentation
                </a>{" "}
                ·{" "}
                <a
                  href="https://github.com/arpitagarwala/hindu-panchang"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t(
                    "Methods & public AGPL source",
                    "विधियाँ और सार्वजनिक AGPL स्रोत",
                  )}
                </a>{" "}
                · <Link href="/privacy">{t("Privacy", "गोपनीयता")}</Link>
              </p>
            </details>
          </div>
        ) : (
          <div className={`${s.grid} ${s.noPrint}`}>
            <article className={s.card}>
              <Sparkles size={24} />
              <h3>{t("14 birth charts", "14 जन्म कुंडलियाँ")}</h3>
              <p>
                {t(
                  "D1, D2, D9, D10 and more, in North and South Indian layouts with readable planet tables.",
                  "D1, D2, D9, D10 और अन्य, उत्तर व दक्षिण भारतीय शैली और स्पष्ट ग्रह तालिका में।",
                )}
              </p>
            </article>
            <article className={s.card}>
              <h3>{t("Understand your periods", "अपनी दशाएँ समझें")}</h3>
              <p>
                {t(
                  "Explore Mahadasha, Antardasha and a monthly outlook grounded in your birth details.",
                  "जन्म विवरण से महादशा, अंतरदशा और मासिक झलक देखें।",
                )}
              </p>
            </article>
            <article className={s.card}>
              <h3>{t("Keep your own copy", "अपनी प्रति रखें")}</h3>
              <p>
                {t(
                  "No account needed. Download a complete private report that opens offline.",
                  "खाता आवश्यक नहीं। पूरा निजी पाठ डाउनलोड करें जो ऑफलाइन खुलता है।",
                )}
              </p>
            </article>
          </div>
        )}
      </main>
      <footer className={s.footer}>
        <button className={s.noPrint} onClick={clear} disabled={busy}>
          {t("Clear saved birth data", "सहेजा जन्म डेटा हटाएँ")}
        </button>
        <p>
          {t("Created and owned by", "निर्माता और स्वामी")}{" "}
          <strong>Arpit Agarwala</strong> ·{" "}
          <a href="https://arpitagarwala.com" target="_blank" rel="noreferrer">
            arpitagarwala.com
          </a>
        </p>
        <p>
          <Link href="/">{t("Panchang", "पंचांग")}</Link> ·{" "}
          <Link href="/privacy">{t("Privacy", "गोपनीयता")}</Link> ·{" "}
          <a href="https://github.com/arpitagarwala/hindu-panchang">
            AGPL source
          </a>
        </p>
      </footer>
    </div>
  );
}
