"use client";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import CityAutocomplete from "@/components/Common/CityAutocomplete";
import type { CityInfo } from "@/lib/geo/cities";
import type { BirthInput } from "@/lib/jyotish/types";
import s from "./Jyotish.module.css";
export default function BirthForm({
  value,
  onChange,
  hi,
  busy,
  onSubmit,
  remember,
  onRemember,
}: {
  value: BirthInput;
  onChange: Dispatch<SetStateAction<BirthInput>>;
  hi: boolean;
  busy: boolean;
  onSubmit: () => void;
  remember: boolean;
  onRemember: (v: boolean) => void;
}) {
  const [different, setDifferent] = useState(
      value.residence.latitude !== value.latitude ||
        value.residence.longitude !== value.longitude ||
        value.residence.timeZone !== value.timeZone,
    ),
    [placeError, setPlaceError] = useState(""),
    [locating, setLocating] = useState(false),
    [birthPending, setBirthPending] = useState(false),
    [residencePending, setResidencePending] = useState(false),
    revision = useRef(0);
  const t = (en: string, hindi: string) => (hi ? hindi : en);
  const update = (patch: Partial<BirthInput>) =>
    onChange((previous) => {
      const next = { ...previous, ...patch };
      if (!different && !("residence" in patch))
        next.residence = {
          place: next.place,
          latitude: next.latitude,
          longitude: next.longitude,
          timeZone: next.timeZone,
        };
      return next;
    });
  async function selectCity(city: CityInfo, residence = false) {
    const version = ++revision.current;
    setPlaceError("");
    setLocating(true);
    try {
      let timeZone = city.timeZone;
      if (!timeZone) {
        const response = await fetch(
          `/api/geocode?lat=${city.latitude}&lon=${city.longitude}`,
          { signal: AbortSignal.timeout(7000) },
        );
        if (!response.ok) throw 0;
        timeZone = (await response.json()).timeZone;
      }
      if (!timeZone) throw 0;
      if (version !== revision.current) return;
      const place = [city.name, city.state, city.country]
          .filter(Boolean)
          .join(", "),
        p = {
          place,
          latitude: city.latitude,
          longitude: city.longitude,
          timeZone,
        };
      if (residence) update({ residence: p });
      else update({ ...p, ...(!different ? { residence: p } : {}) });
    } catch {
      if (version !== revision.current) return;
      if (residence) setResidencePending(true);
      else setBirthPending(true);
      setPlaceError(
        t(
          "Could not resolve this city’s time zone. Use the manual place settings.",
          "समय क्षेत्र नहीं मिला। स्थान की मैनुअल सेटिंग भरें।",
        ),
      );
    } finally {
      if (version === revision.current) setLocating(false);
    }
  }
  return (
    <form
      className={`${s.card} ${s.noPrint}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!locating && !birthPending && !(different && residencePending))
          onSubmit();
      }}
      aria-label={t("Birth details", "जन्म विवरण")}
    >
      <h2>
        {t("Start with your birth details", "अपने जन्म विवरण से शुरू करें")}
      </h2>
      <p className={s.muted}>
        {t(
          "Use the time recorded at your birth place. Your current location does not replace your birth place.",
          "जन्म स्थान पर दर्ज समय भरें। आपका वर्तमान स्थान जन्म स्थान की जगह नहीं लेता।",
        )}
      </p>
      <fieldset
        disabled={busy}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        <div className={s.form}>
          <label className={s.field}>
            {t("Name (optional)", "नाम (वैकल्पिक)")}
            <input
              maxLength={80}
              autoComplete="off"
              value={value.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          <label className={s.field}>
            {t("Date of birth", "जन्म तिथि")}
            <input
              required
              type="date"
              min="1900-01-01"
              value={value.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </label>
          <label className={s.field}>
            {t("Birth time · 24-hour", "जन्म समय · 24 घंटे")}
            <input
              required
              type="time"
              value={value.time}
              onChange={(e) => update({ time: e.target.value })}
            />
            <small>
              {t(
                "14:30 means 2:30 PM. An unknown time cannot produce a dependable ascendant.",
                "14:30 = दोपहर 2:30। समय अज्ञात हो तो भरोसेमंद लग्न नहीं बनता।",
              )}
            </small>
          </label>
          <div className={`${s.field} ${s.wide}`}>
            <span id="birth-place-label">{t("Birth place", "जन्म स्थान")}</span>
            <CityAutocomplete
              ariaLabelledBy="birth-place-label"
              onSelectionPendingChange={setBirthPending}
              value={value.place}
              onSelect={(city) => selectCity(city)}
              placeholder={t(
                "Search a city, town or village…",
                "शहर, कस्बा या गाँव खोजें…",
              )}
            />
            <small>
              {t("Selected place", "चुना स्थान")}: {value.place} ·{" "}
              {value.timeZone}
              {locating ? " …" : ""}
            </small>
          </div>
          <label className={s.field}>
            {t("Birth-time uncertainty", "जन्म समय में अनिश्चितता")}
            <select
              value={value.uncertaintyMinutes}
              onChange={(e) =>
                update({ uncertaintyMinutes: Number(e.target.value) })
              }
            >
              <option value={0}>
                {t("Recorded exact time", "दर्ज सटीक समय")}
              </option>
              {[1, 5, 15, 30, 60, 120].map((n) => (
                <option key={n} value={n}>
                  ± {n} {t("minutes", "मिनट")}
                </option>
              ))}
            </select>
          </label>
          <label className={s.field}>
            {t("Reading date", "पाठ की तिथि")}
            <input
              required
              type="date"
              min={value.date || "1900-01-01"}
              value={value.targetDate}
              onChange={(e) => update({ targetDate: e.target.value })}
            />
            <small>
              {t(
                "Updates periods, monthly outlook and daily windows.",
                "दशा, मासिक झलक और दैनिक समय इस तिथि के हैं।",
              )}
            </small>
          </label>
          <label className={s.field}>
            {t("Rahu / Ketu calculation", "राहु / केतु गणना")}
            <select
              value={value.node}
              onChange={(e) =>
                update({ node: e.target.value as BirthInput["node"] })
              }
            >
              <option value="mean">{t("Mean node", "मध्यम राहु")}</option>
              <option value="true">{t("True node", "स्पष्ट राहु")}</option>
            </select>
          </label>
          <label className={`${s.check} ${s.wide}`}>
            <input
              type="checkbox"
              checked={different}
              onChange={(e) => {
                setDifferent(e.target.checked);
                if (!e.target.checked)
                  update({
                    residence: {
                      place: value.place,
                      latitude: value.latitude,
                      longitude: value.longitude,
                      timeZone: value.timeZone,
                    },
                  });
              }}
            />
            {t(
              "I live somewhere else · use a different place for daily timings",
              "मैं किसी अन्य स्थान पर रहता हूँ · दैनिक समय के लिए दूसरा स्थान",
            )}
          </label>
          {different ? (
            <div className={`${s.field} ${s.wide}`}>
              <span id="residence-label">
                {t(
                  "Current place for timings",
                  "दैनिक समय के लिए वर्तमान स्थान",
                )}
              </span>
              <CityAutocomplete
                ariaLabelledBy="residence-label"
                onSelectionPendingChange={setResidencePending}
                value={value.residence.place}
                onSelect={(city) => selectCity(city, true)}
                placeholder={t("Search current city…", "वर्तमान शहर खोजें…")}
              />
              <small>
                {value.residence.place} · {value.residence.timeZone}
              </small>
            </div>
          ) : null}
          <details className={s.wide}>
            <summary>
              {t(
                "Manual place & clock-change settings",
                "मैनुअल स्थान और घड़ी बदलने की सेटिंग",
              )}
            </summary>
            <div className={s.form}>
              <label className={s.field}>
                {t("Birth latitude", "जन्म अक्षांश")}
                <input
                  type="number"
                  required
                  min={-89.5}
                  max={89.5}
                  step="any"
                  value={Number.isFinite(value.latitude) ? value.latitude : ""}
                  onChange={(e) => update({ latitude: e.target.valueAsNumber })}
                />
              </label>
              <label className={s.field}>
                {t("Birth longitude", "जन्म देशांतर")}
                <input
                  required
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  value={
                    Number.isFinite(value.longitude) ? value.longitude : ""
                  }
                  onChange={(e) =>
                    update({ longitude: e.target.valueAsNumber })
                  }
                />
              </label>
              <label className={s.field}>
                {t("Birth IANA time zone", "जन्म का IANA समय क्षेत्र")}
                <input
                  required
                  value={value.timeZone}
                  onChange={(e) => update({ timeZone: e.target.value })}
                  placeholder="Asia/Kolkata"
                />
              </label>
              <label className={s.field}>
                {t("Birth place label", "जन्म स्थान का नाम")}
                <input
                  required
                  maxLength={120}
                  value={value.place}
                  onChange={(e) => {
                    setBirthPending(false);
                    update({ place: e.target.value });
                  }}
                />
              </label>
              <label className={s.field}>
                {t(
                  "Repeated birth time during DST",
                  "घड़ी पीछे करने पर दोहराया जन्म समय",
                )}
                <select
                  value={value.overlap}
                  onChange={(e) =>
                    update({ overlap: e.target.value as BirthInput["overlap"] })
                  }
                >
                  <option value="reject">
                    {t("Ask me if ambiguous", "अस्पष्ट हो तो पहले बताएँ")}
                  </option>
                  <option value="earlier">
                    {t("First occurrence", "पहली बार वाला समय")}
                  </option>
                  <option value="later">
                    {t("Second occurrence", "दूसरी बार वाला समय")}
                  </option>
                </select>
              </label>
              {different ? (
                <>
                  <label className={s.field}>
                    {t("Current place label", "वर्तमान स्थान का नाम")}
                    <input
                      required
                      maxLength={120}
                      value={value.residence.place}
                      onChange={(e) => {
                        setResidencePending(false);
                        update({
                          residence: {
                            ...value.residence,
                            place: e.target.value,
                          },
                        });
                      }}
                    />
                  </label>
                  <label className={s.field}>
                    {t("Current latitude", "वर्तमान अक्षांश")}
                    <input
                      required
                      type="number"
                      min={-89.5}
                      max={89.5}
                      step="any"
                      value={
                        Number.isFinite(value.residence.latitude)
                          ? value.residence.latitude
                          : ""
                      }
                      onChange={(e) =>
                        update({
                          residence: {
                            ...value.residence,
                            latitude: e.target.valueAsNumber,
                          },
                        })
                      }
                    />
                  </label>
                  <label className={s.field}>
                    {t("Current longitude", "वर्तमान देशांतर")}
                    <input
                      required
                      type="number"
                      min={-180}
                      max={180}
                      step="any"
                      value={
                        Number.isFinite(value.residence.longitude)
                          ? value.residence.longitude
                          : ""
                      }
                      onChange={(e) =>
                        update({
                          residence: {
                            ...value.residence,
                            longitude: e.target.valueAsNumber,
                          },
                        })
                      }
                    />
                  </label>
                  <label className={s.field}>
                    {t("Current time zone", "वर्तमान समय क्षेत्र")}
                    <input
                      required
                      value={value.residence.timeZone}
                      onChange={(e) =>
                        update({
                          residence: {
                            ...value.residence,
                            timeZone: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                </>
              ) : null}
            </div>
            <p className={s.muted}>
              {t(
                "Time-zone boundaries and historical records can be imperfect. Confirm the birth place’s legal time zone, especially near borders or before 1970.",
                "सीमा और पुराने समय क्षेत्र के रिकॉर्ड अपूर्ण हो सकते हैं। खासकर सीमा के पास या 1970 से पहले जन्म का कानूनी समय क्षेत्र जाँचें।",
              )}
            </p>
          </details>
          <label className={`${s.check} ${s.wide}`}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => onRemember(e.target.checked)}
            />
            {t(
              "Save this birth profile and report on this device (up to 3 profiles)",
              "जन्म विवरण और पाठ इस उपकरण पर सहेजें (अधिकतम 3 प्रोफाइल)",
            )}
          </label>
          <p className={`${s.muted} ${s.wide}`}>
            {t(
              "Birth details are sent securely to this site for calculation and are not saved in a server database. No astrology API or AI subscription is used.",
              "गणना के लिए जन्म विवरण इसी साइट पर भेजा जाता है, सर्वर डेटाबेस में सहेजा नहीं जाता। कोई ज्योतिष API या AI सदस्यता नहीं है।",
            )}
          </p>
          <div className={s.wide}>
            <button
              className={s.primary}
              disabled={
                busy ||
                locating ||
                birthPending ||
                (different && residencePending)
              }
              type="submit"
            >
              {busy
                ? t("Calculating your Kundali…", "आपकी कुंडली बन रही है…")
                : t("Generate my Kundali", "मेरी कुंडली बनाएँ")}
            </button>
          </div>
          {placeError ? (
            <p role="alert" className={s.wide}>
              {placeError}
            </p>
          ) : null}
          {birthPending || (different && residencePending) ? (
            <p className={s.wide} role="status">
              {t(
                "Select a city from the results, or confirm its name, coordinates and time zone in manual settings.",
                "सूची से स्थान चुनें, या मैनुअल सेटिंग में नाम, निर्देशांक और समय क्षेत्र की पुष्टि करें।",
              )}
            </p>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
