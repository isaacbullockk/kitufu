import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import type { User } from "@db/schema";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { getSessionCookieOptions } from "./lib/cookies";
import { hashPassword, verifyPassword, localUnionId } from "./lib/passwords";
import { rateLimit, recordFailure, clearFailures } from "./lib/rate-limit";
import { env } from "./lib/env";
import { signSessionToken, verifySessionToken } from "./session";
import { findUserByUnionId, upsertUser, touchLastSignIn, promoteToAdmin } from "./queries/users";

// User object as exposed to request context and API responses — never carries
// the password hash out of the database layer.
export type SafeUser = Omit<User, "passwordHash">;

// ── Request authentication (session cookie → user) ──────────────────────────

export async function authenticateRequest(headers: Headers): Promise<SafeUser> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    console.warn("[auth] Session token verification failed.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

// ── Local email + password auth ──────────────────────────────────────────────
// "Sign in with Kimi" is not portable to self-hosted deployments (Kimi
// provisions OAuth clients only for sites hosted on Kimi's own platform), so
// kitufu.com uses its own account system backed by the users table.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;
const NAME_MAX = 100;
const LOCAL_CLIENT_ID = "kitufu-local";

// Pre-computed scrypt hash used to equalize timing for unknown emails
const DUMMY_HASH =
  "scrypt$16384$8$1$f321d2220d1ad133c7a910fca3170e03$27b7d4e4aa5aab2840c5dc863c84f66f1d3fdd01b2b9a47a6e302dae12e4972922546d2d5899306365287bbab3ec4655871bfff9c40243b1298d2e5b98cd50b7";

function clientIp(c: Context): string {
  // Behind Railway's edge proxy the last x-forwarded-for entry is the one the
  // proxy itself appended; earlier entries can be spoofed by the client.
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",");
    return parts[parts.length - 1].trim();
  }
  return "unknown";
}

function sanitizeName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  // Strip control characters, collapse whitespace, cap length
  const cleaned = name.replace(/[\x00-\x1f\x7f]/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.slice(0, NAME_MAX);
}

function authDisabled(c: Context) {
  return c.json(
    { error: "Authentication is temporarily unavailable. Please try again later." },
    503,
  );
}

async function issueSession(c: Context, unionId: string) {
  const token = await signSessionToken({ unionId, clientId: LOCAL_CLIENT_ID });
  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, {
    ...cookieOpts,
    maxAge: Session.maxAgeMs / 1000,
  });
}

export function createRegisterHandler() {
  return async (c: Context) => {
    if (!env.isSecretSecure) return authDisabled(c);

    let body: { email?: unknown; password?: unknown; name?: unknown };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = sanitizeName(body.name);

    if (!EMAIL_RE.test(email) || email.length > 320) {
      return c.json({ error: "Please enter a valid email address." }, 400);
    }
    if (password.length < PASSWORD_MIN) {
      return c.json({ error: `Password must be at least ${PASSWORD_MIN} characters.` }, 400);
    }
    if (password.length > PASSWORD_MAX) {
      return c.json({ error: "Password is too long." }, 400);
    }

    // Throttle registration attempts per source IP
    const ip = clientIp(c);
    const regLimit = rateLimit(`register:${ip}`, 20, 60 * 60 * 1000);
    if (!regLimit.ok) {
      return c.json({ error: "Too many attempts. Please try again later." }, 429);
    }

    const unionId = localUnionId(email);
    const existing = await findUserByUnionId(unionId);
    if (existing) {
      return c.json({ error: "An account with this email already exists. Try signing in." }, 409);
    }

    const passwordHash = hashPassword(password);
    const isOwner = env.ownerEmail !== "" && email === env.ownerEmail;

    try {
      await upsertUser({
        unionId,
        email,
        name: name ?? email.split("@")[0],
        passwordHash,
        lastSignInAt: new Date(),
        ...(isOwner ? { role: "admin" as const } : {}),
      });
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return c.json({ error: "An account with this email already exists. Try signing in." }, 409);
      }
      throw e;
    }

    const user = await findUserByUnionId(unionId);
    if (!user) {
      return c.json({ error: "Account creation failed. Please try again." }, 500);
    }

    await issueSession(c, unionId);
    return c.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      201,
    );
  };
}

export function createLoginHandler() {
  return async (c: Context) => {
    if (!env.isSecretSecure) return authDisabled(c);

    let body: { email?: unknown; password?: unknown };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!EMAIL_RE.test(email) || !password) {
      return c.json({ error: "Invalid email or password." }, 401);
    }

    const ip = clientIp(c);
    const failKey = `login:${ip}:${email}`;

    const user = await findUserByUnionId(localUnionId(email));
    const passwordHash = user?.passwordHash;
    // Always run a verify-shaped operation so timing doesn't reveal account existence
    const ok = passwordHash
      ? verifyPassword(password, passwordHash)
      : (verifyPassword(password, DUMMY_HASH), false);

    if (!ok || !user) {
      const result = recordFailure(failKey, 10, 10 * 60 * 1000);
      if (!result.ok) {
        return c.json({ error: "Too many attempts. Please try again later." }, 429);
      }
      return c.json({ error: "Invalid email or password." }, 401);
    }

    clearFailures(failKey);
    await touchLastSignIn(user.unionId);

    // Self-healing owner promotion: if OWNER_EMAIL was set after the owner
    // registered, promote them on their next successful login.
    if (env.ownerEmail !== "" && user.email && user.email.toLowerCase() === env.ownerEmail && user.role !== "admin") {
      await promoteToAdmin(user.unionId);
      user.role = "admin";
    }

    await issueSession(c, user.unionId);
    return c.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  };
}
