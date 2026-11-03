import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { validateInput, createJyotishReport } from "@/lib/jyotish/server";
import { BirthInputError } from "@/lib/jyotish/birth-time";
export const runtime = "nodejs";
export const maxDuration = 30;
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
// Best-effort burst protection per warm instance; not a global billing meter.
const bursts = new Map<string, { count: number; until: number }>();
export async function POST(request: NextRequest) {
  if (process.env.JYOTISH_ENABLED === "false")
    return NextResponse.json(
      {
        error:
          "Kundali generation is temporarily paused. Saved reports remain on your device. / कुंडली बनाना अभी रुका है। सहेजे पाठ उपलब्ध हैं।",
      },
      { status: 503, headers: { ...headers, "Retry-After": "3600" } },
    );
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { error: "Use the form on this website." },
      { status: 403, headers },
    );
  const identity = createHash("sha256")
      .update(request.headers.get("x-forwarded-for")?.split(",")[0] || "local")
      .digest("hex")
      .slice(0, 20),
    now = Date.now();
  for (const [key, b] of bursts) if (b.until < now) bursts.delete(key);
  const burst = bursts.get(identity) || { count: 0, until: now + 60000 };
  if (++burst.count > 12)
    return NextResponse.json(
      {
        error:
          "Please wait a minute before generating another report. / अगले पाठ से पहले एक मिनट रुकें।",
      },
      { status: 429, headers: { ...headers, "Retry-After": "60" } },
    );
  if (bursts.size < 2000) bursts.set(identity, burst);
  try {
    if (Number(request.headers.get("content-length")) > 8192)
      return NextResponse.json(
        { error: "Birth details are too large." },
        { status: 413, headers },
      );
    const raw = await request.text();
    if (raw.length > 8192)
      return NextResponse.json(
        { error: "Birth details are too large." },
        { status: 413, headers },
      );
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Send valid JSON birth details." },
        { status: 400, headers },
      );
    }
    const input = validateInput(value),
      report = createJyotishReport(input);
    return NextResponse.json(report, { headers });
  } catch (error) {
    if (error instanceof BirthInputError)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers },
      );
    // Birth details are never written to application logs or a server database.
    console.error("Jyotish calculation unavailable");
    return NextResponse.json(
      {
        error:
          "The chart could not be calculated. Check your date and time zone, or try again later. / गणना नहीं हो सकी। तिथि और समय क्षेत्र जाँचें।",
      },
      { status: 503, headers },
    );
  }
}
