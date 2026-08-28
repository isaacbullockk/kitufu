import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    // Same-origin app (kitufu.com serves both SPA and API); no cross-site flow
    // remains now that OAuth is gone, so Lax is sufficient and blocks CSRF
    // via cross-site POSTs.
    sameSite: "Lax",
    secure: !localhost,
  };
}
