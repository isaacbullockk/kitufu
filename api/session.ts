import * as jose from "jose";
import { env } from "./lib/env";

export type SessionPayload = {
  unionId: string;
  clientId: string;
};

const JWT_ALG = "HS256";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  if (!env.isSecretSecure) {
    throw new Error("Session signing disabled: weak APP_SECRET in production");
  }
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token || !env.isSecretSecure) {
    if (!token) console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId } as SessionPayload;
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
