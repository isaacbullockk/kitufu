/**
 * Kitufu Booking Bureau — Multi-Model AI Pipeline
 *
 * Stage 1  LOGISTICS      NVIDIA Nemotron 3 Ultra  — booking payload → logistics blueprint
 * Stage 2  COMMUNICATIONS Kimi K2.5 (Moonshot)     — blueprint → guest/host communications
 * Stage 3  QA GATE        NVIDIA Nemotron 3 Ultra  — final logistical gateway (temperature 0.0)
 *
 * Provider routing:
 *   1. OPENROUTER_API_KEY  → https://openrouter.ai/api/v1  (primary)
 *   2. NVIDIA_API_KEY      → https://integrate.api.nvidia.com/v1  (fallback)
 *   3. neither             → pipeline is skipped gracefully (booking still succeeds)
 *
 * OpenRouter model ids: nvidia/nemotron-3-ultra-550b-a55b, moonshotai/kimi-k2.5.
 * On NVIDIA NIM the same ids are used as-is.
 */

const NIM_BASE = "https://integrate.api.nvidia.com/v1";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const MODELS = {
  openrouter: {
    logistics: "nvidia/nemotron-3-ultra-550b-a55b",
    comms: "moonshotai/kimi-k2.5",
    qa: "nvidia/nemotron-3-ultra-550b-a55b",
  },
  nim: {
    logistics: "nvidia/nemotron-3-ultra-550b-a55b",
    comms: "moonshotai/kimi-k2.5",
    qa: "nvidia/nemotron-3-ultra-550b-a55b",
  },
} as const;

type Provider = {
  kind: keyof typeof MODELS;
  baseUrl: string;
  apiKey: string;
  headers: Record<string, string>;
};

function getProvider(): Provider | null {
  const orKey = process.env.OPENROUTER_API_KEY?.trim();
  if (orKey) {
    return {
      kind: "openrouter",
      baseUrl: OPENROUTER_BASE,
      apiKey: orKey,
      headers: {
        Authorization: `Bearer ${orKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kitufu.com",
        "X-Title": "Kitufu Booking Bureau",
      },
    };
  }
  const nimKey = process.env.NVIDIA_API_KEY?.trim();
  if (nimKey) {
    return {
      kind: "nim",
      baseUrl: NIM_BASE,
      apiKey: nimKey,
      headers: {
        Authorization: `Bearer ${nimKey}`,
        "Content-Type": "application/json",
      },
    };
  }
  return null;
}

/* ---------------------------------- types ---------------------------------- */


/** Strip control chars + cap length so guest/host-supplied strings can't hijack the AI prompt. */
function sanitizeField(v: string, max = 200): string {
  return String(v ?? "")
    .replace(/[\x00-\x1f\x7f]/g, " ")   // control chars
    .replace(/`/g, "'")                     // backticks (fence escape)
    .slice(0, max)
    .trim();
}

function sanitizePayload(p: BookingPayload): BookingPayload {
  return {
    ...p,
    propertyTitle: sanitizeField(p.propertyTitle, 150),
    propertyLocation: sanitizeField(p.propertyLocation, 150),
    distanceToStadium: sanitizeField(p.distanceToStadium, 60),
    guestName: sanitizeField(p.guestName, 120),
    hostName: sanitizeField(p.hostName, 120),
  };
}

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
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  roomType: "multi_share" | "twin" | "private";
  addShuttle: number; // 0 | 1
  seasonPass: number; // 0 | 1
  priceSubtotal: number; // UGX — room only
  serviceFee: number; // UGX
  vat: number; // UGX
  totalPrice: number; // UGX — subtotal + serviceFee + vat (server-authoritative)
  currency: "UGX";
}

export interface BookingLogistics {
  booking_ref: string;
  stay_summary: string;
  nights: number;
  check_in: string;
  check_out: string;
  room_type: string;
  occupancy: { adults: number; children: number };
  shuttle_booked: boolean;
  season_pass: boolean;
  strict_terms: string[];
  price_breakdown: {
    subtotal_ugx: number;
    service_fee_ugx: number;
    vat_ugx: number;
    total_ugx: number;
  };
  logistics_notes: string;
}

export interface BookingEmails {
  guest_subject: string;
  guest_email: string;
  host_subject: string;
  host_email: string;
}

export interface QaResult {
  approved: boolean;
  mismatches: string[];
  corrected_emails: BookingEmails | null;
}

export interface PipelineResult {
  status: "approved" | "qa_rejected" | "skipped" | "error";
  logistics?: BookingLogistics;
  emails?: BookingEmails;
  qa?: QaResult;
  error?: string;
}

/* ------------------------------ model caller ------------------------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callModel(
  provider: Provider,
  model: string,
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; json?: boolean } = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 4096,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const MAX_ATTEMPTS = 3;
  let lastErr = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: provider.headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
      lastErr = "empty completion content";
    } else {
      lastErr = `${res.status} ${await res.text().then((t) => t.slice(0, 300))}`;
      // Rate limited (free tier) → back off and retry
      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        console.warn(`[pipeline] ${model} 429, retrying in ${20 * attempt}s`);
        await sleep(20_000 * attempt);
        continue;
      }
      // Provider rejected json mode → retry without it
      if (res.status === 400 && opts.json) {
        delete body.response_format;
        continue;
      }
    }
    if (attempt < MAX_ATTEMPTS) await sleep(2000);
  }
  throw new Error(`[pipeline] ${model} via ${provider.kind} failed: ${lastErr}`);
}

function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1] : raw;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("[pipeline] model returned no JSON object");
  }
  return JSON.parse(text.slice(start, end + 1)) as T;
}

/* ------------------------- STAGE 1 — LOGISTICS ----------------------------- */

export async function run_booking_logistics(
  booking_payload: BookingPayload,
): Promise<BookingLogistics> {
  const provider = getProvider();
  if (!provider) throw new Error("[pipeline] no provider key set");
  const raw = await callModel(
    provider,
    MODELS[provider.kind].logistics,
    [
      "You are the logistics router for Kitufu, an accommodation booking bureau",
      "for AFCON 2027 in Uganda. Convert the booking payload into a strict",
      "operational logistics blueprint as JSON. AFCON 2027 runs mid-June to",
      "mid-July 2027. Reject nothing; normalise and structure. Output ONLY JSON.",
    ].join(" "),
    `Booking payload:\n${JSON.stringify(booking_payload, null, 2)}\n\n` +
      `Return JSON with keys: booking_ref, stay_summary, nights, check_in, ` +
      `check_out, room_type, occupancy {adults, children}, shuttle_booked, ` +
      `season_pass, strict_terms (array of strings: check-in/check-out times, ` +
      `ID requirement, payment terms, cancellation rule), price_breakdown ` +
      `{subtotal_ugx, service_fee_ugx, vat_ugx, total_ugx}, logistics_notes.`,
    { temperature: 0.2, maxTokens: 4096, json: true },
  );
  return extractJson<BookingLogistics>(raw);
}

/* ----------------------- STAGE 2 — COMMUNICATIONS -------------------------- */

export async function run_booking_communications(
  logistics_json: BookingLogistics,
  payload: BookingPayload,
): Promise<BookingEmails> {
  const provider = getProvider();
  if (!provider) throw new Error("[pipeline] no provider key set");
  const raw = await callModel(
    provider,
    MODELS[provider.kind].comms,
    [
      "You are Kitufu's guest communications writer (Kitufu = AFCON 2027 Uganda",
      "booking bureau). Write warm, concise, plain-text emails. Use only facts",
      "from the logistics blueprint — never invent prices, dates or policies.",
      "Output ONLY JSON.",
    ].join(" "),
    `Logistics blueprint:\n${JSON.stringify(logistics_json, null, 2)}\n\n` +
      `Guest name: ${payload.guestName}\nProperty: ${payload.propertyTitle}\n\n` +
      `Return JSON with keys: guest_subject, guest_email (confirmation with ` +
      `booking ref, dates, room, price breakdown incl. VAT, strict_terms as a ` +
      `bulleted list), host_subject, host_email (new-booking alert: guest ` +
      `name, dates, party size, room type, shuttle/season pass flags).`,
    { temperature: 0.7, maxTokens: 4096, json: true },
  );
  return extractJson<BookingEmails>(raw);
}

/* ---------------------------- STAGE 3 — QA GATE ---------------------------- */

export async function run_booking_qa(
  payload: BookingPayload,
  logistics: BookingLogistics,
  emails: BookingEmails,
): Promise<QaResult> {
  const provider = getProvider();
  if (!provider) throw new Error("[pipeline] no provider key set");
  const raw = await callModel(
    provider,
    MODELS[provider.kind].qa,
    [
      "You are the final logistical QA gateway for Kitufu bookings. Compare the",
      "original booking payload against the logistics blueprint and the drafted",
      "emails. Verify: booking_ref, dates, nights, room type, occupancy, all",
      "price figures (subtotal + service fee + VAT = total), and that strict",
      "terms appear verbatim in the guest email. Temperature 0 — be exact.",
      "Output ONLY JSON.",
    ].join(" "),
    `ORIGINAL PAYLOAD:\n${JSON.stringify(payload, null, 2)}\n\n` +
      `LOGISTICS BLUEPRINT:\n${JSON.stringify(logistics, null, 2)}\n\n` +
      `DRAFTED EMAILS:\n${JSON.stringify(emails, null, 2)}\n\n` +
      `Return JSON with keys: approved (boolean), mismatches (array of strings, ` +
      `empty if approved), corrected_emails (full corrected BookingEmails ` +
      `object, or null if approved). If ANY figure or date is wrong, set ` +
      `approved=false and provide corrected_emails.`,
    { temperature: 0.0, maxTokens: 4096, json: true },
  );
  return extractJson<QaResult>(raw);
}


/* ------------------------- bounded pipeline queue ---------------------------
 * The booking mutation must never wait on 3 sequential AI calls (up to ~9 min).
 * Jobs are queued in-process and worked off with bounded concurrency, so a
 * booking burst can't exhaust the event loop / memory. Fire-and-forget for the
 * caller; the queue drains in the background.
 */
const PIPELINE_CONCURRENCY = 2;   // at most N model pipelines in flight
const PIPELINE_QUEUE_MAX = 200;   // drop + log beyond this (protects memory)

const pipelineQueue: BookingPayload[] = [];
let pipelineActive = 0;

async function pipelineWorker(): Promise<void> {
  while (pipelineQueue.length > 0 && pipelineActive < PIPELINE_CONCURRENCY) {
    const job = pipelineQueue.shift();
    if (!job) break;
    pipelineActive++;
    runBookingPipeline(job)
      .catch((e) => console.error("[pipeline] job failed:", e))
      .finally(() => {
        pipelineActive--;
        void pipelineWorker();
      });
  }
}

/** Enqueue a booking for async AI processing. Returns immediately. */
export function enqueueBookingPipeline(payload: BookingPayload): void {
  if (pipelineQueue.length >= PIPELINE_QUEUE_MAX) {
    console.error("[pipeline] queue full (" + PIPELINE_QUEUE_MAX + ") — dropping booking " + payload.bookingRef);
    return;
  }
  pipelineQueue.push(payload);
  void pipelineWorker();
}

/* ------------------------------ ORCHESTRATOR ------------------------------- */

/**
 * Full pipeline: payload → logistics → communications → QA gate → webhook.
 * Never throws; returns a PipelineResult so the booking router can proceed
 * regardless of AI availability.
 */
export async function runBookingPipeline(
  rawPayload: BookingPayload,
): Promise<PipelineResult> {
  const payload = sanitizePayload(rawPayload);
  if (!getProvider()) {
    console.log("[pipeline] no OPENROUTER_API_KEY / NVIDIA_API_KEY set — skipping");
    return { status: "skipped" };
  }
  try {
    const logistics = await run_booking_logistics(payload);
    const emails = await run_booking_communications(logistics, payload);
    const qa = await run_booking_qa(payload, logistics, emails);
    const finalEmails =
      !qa.approved && qa.corrected_emails ? qa.corrected_emails : emails;

    const webhook = process.env.BOOKING_WEBHOOK_URL?.trim();
    if (webhook && qa.approved) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "booking.approved",
          payload,
          logistics,
          emails: finalEmails,
          qa,
        }),
        signal: AbortSignal.timeout(15_000),
      }).catch((e) => console.warn("[pipeline] webhook failed:", e));
    }
    return {
      status: qa.approved ? "approved" : "qa_rejected",
      logistics,
      emails: finalEmails,
      qa,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pipeline] error:", msg);
    return { status: "error", error: msg };
  }
}
