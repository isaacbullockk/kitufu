/**
 * Kitufu Multi-Model Booking Pipeline
 * ===================================
 * Three-stage architecture:
 *
 *   1. LOGISTICS LAYER  — NVIDIA Nemotron 3 Ultra (nvidia/nemotron-3-ultra-550b-a55b)
 *      Ingests raw booking payloads, validates date/pricing logic, and outputs a
 *      clean structured JSON blueprint of the booking.
 *
 *   2. COMMUNICATIONS LAYER — Kimi (moonshotai/kimi-k2.5 via NVIDIA NIM)
 *      Takes the structured blueprint and writes warm, persuasive, highly
 *      personalized outreach emails for the guest and the host.
 *
 *   3. QA CHECKSTEP — NVIDIA Nemotron 3 Ultra
 *      Reviews the generated emails against the original JSON blueprint to
 *      guarantee zero data hallucination (price, dates, names, booking ref
 *      must match EXACTLY) before any webhook fires or email is logged.
 *
 * Both models are called through the OpenAI-compatible NVIDIA NIM endpoint,
 * so the single NVIDIA_API_KEY environment variable drives the whole pipeline.
 */

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NEMOTRON_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";
const KIMI_MODEL = "moonshotai/kimi-k2.5";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookingPayload {
  bookingId: number;
  bookingRef: string;
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  distanceToStadium: string;
  guestName: string;
  guestEmail: string;
  hostName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: string;
  addShuttle: number;
  seasonPass: number;
  totalPrice: number;
  currency: string;
}

export interface BookingLogistics {
  booking_ref: string;
  guest_name: string;
  property_title: string;
  property_location: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: { adults: number; children: number };
  room_type: string;
  shuttle: boolean;
  season_pass: boolean;
  total_price: number;
  currency: string;
  price_per_night: number;
  validation_notes: string[];
  is_valid: boolean;
  strict_terms: string[];
}

export interface BookingEmails {
  guest_subject: string;
  guest_body: string;
  host_subject: string;
  host_body: string;
}

export interface QaResult {
  approved: boolean;
  mismatches: string[];
  corrected_guest_body?: string;
  corrected_host_body?: string;
  qa_notes: string;
}

export interface PipelineResult {
  success: boolean;
  stage: "logistics" | "communications" | "qa" | "complete" | "disabled";
  logistics?: BookingLogistics;
  emails?: BookingEmails;
  qa?: QaResult;
  error?: string;
}

// ---------------------------------------------------------------------------
// Shared NVIDIA NIM caller (OpenAI-compatible)
// ---------------------------------------------------------------------------

function getApiKey(): string {
  return process.env.NVIDIA_API_KEY || "";
}

async function callNim(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 2048,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("NIM " + res.status + " for " + model + ": " + text.slice(0, 400));
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("NIM returned empty content for " + model);
  return content;
}

/** Extract the first JSON object from a model response (tolerates prose fences). */
function extractJson<T>(raw: string): T {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

// ---------------------------------------------------------------------------
// STAGE 1 — LOGISTICS ROUTER (Nemotron 3 Ultra)
// ---------------------------------------------------------------------------

export async function run_booking_logistics(
  booking_payload: BookingPayload
): Promise<BookingLogistics> {
  const system = [
    "You are the logistics engine of Kitufu, an accommodation booking platform.",
    "You ingest raw booking payloads and output a STRICT JSON blueprint.",
    "Validate: check-out after check-in, dates in sane ISO format, price math",
    "(total_price vs nights and any add-ons), guest counts, and room type.",
    "Rules you must enforce as strict_terms:",
    "- Payment required to confirm the booking.",
    "- Check-in from 14:00, check-out by 11:00 local time.",
    "- Valid ID required at check-in for all adult guests.",
    "- Cancellation policy: full refund up to 7 days before check-in, 50% up to 48h, none after.",
    "If any validation fails set is_valid=false and explain in validation_notes.",
    "Output ONLY the JSON object, no prose.",
  ].join("\n");

  const user =
    "Raw booking payload:\n" +
    JSON.stringify(booking_payload, null, 2) +
    "\n\nReturn JSON with exactly these keys: booking_ref, guest_name, property_title," +
    " property_location, check_in, check_out, nights, guests{adults,children}, room_type," +
    " shuttle, season_pass, total_price, currency, price_per_night, validation_notes[]," +
    " is_valid, strict_terms[]";

  const raw = await callNim(NEMOTRON_MODEL, system, user, { json: true, temperature: 0.1 });
  const parsed = extractJson<BookingLogistics>(raw);

  // Hard server-side sanity backstop — never trust the model blindly.
  if (parsed.booking_ref !== booking_payload.bookingRef) {
    parsed.booking_ref = booking_payload.bookingRef;
  }
  if (parsed.total_price !== booking_payload.totalPrice) {
    parsed.total_price = booking_payload.totalPrice;
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// STAGE 2 — COMMUNICATIONS LAYER (Kimi)
// ---------------------------------------------------------------------------

export async function run_booking_communications(
  logistics_json: BookingLogistics
): Promise<BookingEmails> {
  const system = [
    "You are Kitufu's communications director — warm, persuasive, personal.",
    "You receive a structured booking blueprint (JSON) and write two emails:",
    "1) GUEST email: confirm the booking, make them feel excited and cared for,",
    "   mention the property, dates, and booking reference naturally.",
    "2) HOST email: alert them of the new booking, concise and professional.",
    "CRITICAL: every fact (name, dates, price, reference) MUST come verbatim",
    "from the blueprint JSON. Never invent numbers, dates, or amenities.",
    "Write in plain text with short paragraphs. No markdown, no HTML.",
    "Output ONLY a JSON object with keys:",
    "guest_subject, guest_body, host_subject, host_body.",
  ].join("\n");

  const user =
    "Booking blueprint:\n" +
    JSON.stringify(logistics_json, null, 2) +
    "\n\nWrite the two emails now.";

  const raw = await callNim(KIMI_MODEL, system, user, { json: true, temperature: 0.7, maxTokens: 3000 });
  return extractJson<BookingEmails>(raw);
}

// ---------------------------------------------------------------------------
// STAGE 3 — QA CHECKSTEP (Nemotron 3 Ultra)
// ---------------------------------------------------------------------------

export async function run_booking_qa(
  logistics_json: BookingLogistics,
  emails: BookingEmails
): Promise<QaResult> {
  const system = [
    "You are a zero-tolerance QA auditor for a booking platform.",
    "Compare the generated emails against the booking blueprint JSON.",
    "Check EVERY factual token: booking reference, names, dates, prices,",
    "currency, room type, guest counts, shuttle and season-pass flags.",
    "If any fact in an email contradicts or is absent from the blueprint,",
    "list it in mismatches[]. If mismatches is empty set approved=true,",
    "otherwise approved=false.",
    "When only minor wording fixes are needed, also return corrected_guest_body",
    "and/or corrected_host_body with the exact-fact version.",
    "Output ONLY JSON: {approved, mismatches[], corrected_guest_body?,",
    "corrected_host_body?, qa_notes}.",
  ].join("\n");

  const user =
    "Blueprint:\n" +
    JSON.stringify(logistics_json, null, 2) +
    "\n\nEmails under review:\n" +
    JSON.stringify(emails, null, 2);

  const raw = await callNim(NEMOTRON_MODEL, system, user, { json: true, temperature: 0.0 });
  return extractJson<QaResult>(raw);
}

// ---------------------------------------------------------------------------
// ORCHESTRATOR — runs all three stages, fires webhook only after QA approval
// ---------------------------------------------------------------------------

export async function runBookingPipeline(payload: BookingPayload): Promise<PipelineResult> {
  if (!getApiKey()) {
    console.log("[AI-PIPELINE] NVIDIA_API_KEY not set — pipeline skipped for", payload.bookingRef);
    return { success: true, stage: "disabled" };
  }

  // Stage 1: logistics
  let logistics: BookingLogistics;
  try {
    logistics = await run_booking_logistics(payload);
  } catch (err) {
    console.error("[AI-PIPELINE] logistics failed:", err);
    return { success: false, stage: "logistics", error: String(err) };
  }

  if (!logistics.is_valid) {
    console.warn("[AI-PIPELINE] invalid booking flagged:", logistics.validation_notes);
  }

  // Stage 2: communications
  let emails: BookingEmails;
  try {
    emails = await run_booking_communications(logistics);
  } catch (err) {
    console.error("[AI-PIPELINE] communications failed:", err);
    return { success: false, stage: "communications", logistics, error: String(err) };
  }

  // Stage 3: QA gate
  let qa: QaResult;
  try {
    qa = await run_booking_qa(logistics, emails);
  } catch (err) {
    console.error("[AI-PIPELINE] QA failed:", err);
    return { success: false, stage: "qa", logistics, emails, error: String(err) };
  }

  // Apply corrections if QA provided them
  if (!qa.approved && (qa.corrected_guest_body || qa.corrected_host_body)) {
    emails = {
      ...emails,
      guest_body: qa.corrected_guest_body || emails.guest_body,
      host_body: qa.corrected_host_body || emails.host_body,
    };
    // One re-check after correction; if still failing, block the webhook.
    try {
      qa = await run_booking_qa(logistics, emails);
    } catch (err) {
      console.error("[AI-PIPELINE] QA re-check failed:", err);
      return { success: false, stage: "qa", logistics, emails, error: String(err) };
    }
  }

  if (!qa.approved) {
    console.error("[AI-PIPELINE] QA rejected emails for", payload.bookingRef, qa.mismatches);
    return { success: false, stage: "qa", logistics, emails, qa, error: "QA rejected: " + qa.mismatches.join("; ") };
  }

  // QA approved — fire the webhook
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "booking.pipeline.complete",
          booking_ref: payload.bookingRef,
          logistics,
          emails,
          qa_notes: qa.qa_notes,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      console.error("[AI-PIPELINE] webhook delivery failed:", err);
    }
  }

  return { success: true, stage: "complete", logistics, emails, qa };
}
