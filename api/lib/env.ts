// Environment config — NO external imports that could fail
function getEnv(name: string, fallback: string = ""): string {
  return process.env[name] || fallback;
}

// Railway MySQL auto-detect: tries DATABASE_URL first, then Railway's MYSQL_URL
const dbUrl = getEnv("DATABASE_URL") || getEnv("MYSQL_URL") || getEnv("MYSQL_PUBLIC_URL") || "";

export const env = {
  appId: getEnv("APP_ID", "kitufu"),
  appSecret: getEnv("APP_SECRET", "dev-secret"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: dbUrl,
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://auth.kimi.com"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://platform.kimi.com"),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
