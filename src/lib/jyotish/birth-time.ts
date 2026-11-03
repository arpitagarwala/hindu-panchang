// Resolve historical wall times with the runtime's IANA database, including
// second-level historic offsets. Never interpret a birth time in the host zone.
export class BirthInputError extends Error {}
export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "T12:00:00Z")) &&
    new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function resolveBirthTime(
  date: string,
  time: string,
  timeZone: string,
  overlap: "reject" | "earlier" | "later" = "reject",
) {
  if (!validDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new BirthInputError(
      "Enter a valid birth date and 24-hour birth time. / सही जन्म तिथि और समय भरें।",
    );
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    throw new BirthInputError(
      "Use a valid IANA time zone, for example Asia/Kolkata. / सही समय क्षेत्र चुनें।",
    );
  }
  const wall = Date.parse(`${date}T${time}:00Z`);
  const local = (instant: number) => {
    const parts = formatter.formatToParts(instant),
      n = (key: string) => Number(parts.find((p) => p.type === key)?.value);
    return Date.UTC(
      n("year"),
      n("month") - 1,
      n("day"),
      n("hour"),
      n("minute"),
      n("second"),
    );
  };
  const offsets = new Set<number>();
  for (let h = -48; h <= 48; h += 6) {
    const instant = wall + h * 3600000;
    offsets.add(local(instant) - instant);
  }
  const candidates = [...offsets]
    .map((offset) => wall - offset)
    .filter((instant) => local(instant) === wall)
    .sort((a, b) => a - b);
  if (!candidates.length)
    throw new BirthInputError(
      "This local birth time did not exist during a clock change. Check the recorded time. / घड़ी बदलने के कारण यह स्थानीय समय मौजूद नहीं था।",
    );
  if (candidates.length > 1 && overlap === "reject")
    throw new BirthInputError(
      "This time occurred twice during a clock change. Choose the earlier or later occurrence in birth settings. / यह समय दो बार आया था। पहले या बाद वाला समय चुनें।",
    );
  const instant =
    overlap === "later" ? candidates[candidates.length - 1] : candidates[0];
  return { instant, offsetMinutes: (wall - instant) / 60000 };
}
