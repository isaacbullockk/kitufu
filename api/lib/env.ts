import "dotenv/config";

function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] || defaultValue;
}

// Railway MySQL provides MYSQL_URL. Also check DATABASE_URL for compatibility.
const databaseUrl = getEnv("DATABASE_URL") || getEnv("MYSQL_URL") || getEnv("MYSQL_PUBLIC_URL") || "mysql://root@localhost:3306/kitufu";

export const env = {
  appId: getEnv("APP_ID", "kitufu-residences"),
  appSecret: getEnv("APP_SECRET", "dev-secret-not-for-production"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: databaseUrl,
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://auth.kimi.com"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://platform.kimi.com"),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
