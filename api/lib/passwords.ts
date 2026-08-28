import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";

// scrypt parameters (OWASP-recommended minimums): N=16384, r=8, p=1, 64-byte key
const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const derived = scryptSync(password, salt, KEY_LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const n = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!n || !r || !p) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length, { N: n, r, p });
  return timingSafeEqual(derived, expected);
}

// Local accounts are keyed by a deterministic, non-reversible ID derived from
// the email, so emails never appear in the unionId unique key.
export function localUnionId(email: string): string {
  const digest = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `local:${digest}`;
}
