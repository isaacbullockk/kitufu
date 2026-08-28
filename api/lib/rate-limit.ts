// Minimal in-process fixed-window rate limiter.
// Suitable for a single-instance deployment (Railway). If the app is ever scaled
// to multiple replicas, replace with a shared store (e.g. Redis).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) evictExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

// Failure counter for login attempts — only incremented on failure, cleared on success.
export function recordFailure(key: string, limit: number, windowMs: number) {
  return rateLimit(key, limit, windowMs);
}

export function clearFailures(key: string) {
  buckets.delete(key);
}
