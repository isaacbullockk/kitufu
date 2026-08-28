// Environment config — NO external imports that could fail
function getEnv(name: string, fallback: string = ""): string {
  return process.env[name] || fallback;
}

// Railway MySQL auto-detect: tries DATABASE_URL first, then Railway's MYSQL_URL
const dbUrl = getEnv("DATABASE_URL") || getEnv("MYSQL_URL") || getEnv("MYSQL_PUBLIC_URL") || "";

if (process.env.NODE_ENV === "production") {
  // Soft warnings — never crash the process, but surface misconfiguration loudly in logs
  if (getEnv("APP_SECRET", "dev-secret") === "dev-secret") {
    console.error(
      "[SECURITY] APP_SECRET is not set — session tokens are signed with a public default secret. " +
      "Set APP_SECRET in Railway variables immediately.",
    );
  }
  if (!dbUrl) {
    console.error("[CONFIG] No DATABASE_URL / MYSQL_URL set — database calls will fail.");
  }
  if (!getEnv("APP_ID")) {
    console.error("[CONFIG] APP_ID is not set — OAuth login will fail.");
  }
  if (!getEnv("OWNER_UNION_ID")) {
    console.error("[CONFIG] OWNER_UNION_ID is not set — no user will be auto-promoted to admin.");
  }
}

export const env = {
  appId: getEnv("APP_ID", "kitufu"),
  appSecret: getEnv("APP_SECRET", "dev-secret"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: dbUrl,
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://auth.kimi.ai"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://platform.kimi.ai"),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
