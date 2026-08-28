// Environment config — NO external imports that could fail
function getEnv(name: string, fallback: string = ""): string {
  return process.env[name] || fallback;
}

// Railway MySQL auto-detect: tries DATABASE_URL first, then Railway's MYSQL_URL
const dbUrl = getEnv("DATABASE_URL") || getEnv("MYSQL_URL") || getEnv("MYSQL_PUBLIC_URL") || "";
const appSecret = getEnv("APP_SECRET", "dev-secret");
const isProduction = process.env.NODE_ENV === "production";

// Auth must fail closed in production when the signing secret is weak —
// otherwise anyone can forge session cookies.
const isSecretSecure = !isProduction || (appSecret !== "dev-secret" && appSecret.length >= 32);

if (isProduction) {
  // Soft warnings — never crash the process, but surface misconfiguration loudly in logs
  if (!isSecretSecure) {
    console.error(
      "[SECURITY] APP_SECRET is unset or too short — authentication is DISABLED (fail-closed). " +
      "Set APP_SECRET to a random string of at least 32 characters (openssl rand -hex 32).",
    );
  }
  if (!dbUrl) {
    console.error("[CONFIG] No DATABASE_URL / MYSQL_URL set — database calls will fail.");
  }
  if (!getEnv("OWNER_EMAIL")) {
    console.error("[CONFIG] OWNER_EMAIL is not set — no user will be auto-promoted to admin.");
  }
}

export const env = {
  appSecret,
  isProduction,
  isSecretSecure,
  databaseUrl: dbUrl,
  ownerEmail: getEnv("OWNER_EMAIL", "").trim().toLowerCase(),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
