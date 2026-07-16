import "dotenv/config";

function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] || defaultValue;
}

export const env = {
  appId: getEnv("APP_ID", "kitufu-residences"),
  appSecret: getEnv("APP_SECRET", "dev-secret-not-for-production"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL", "mysql://root@localhost:3306/kitufu"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://auth.kimi.com"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://platform.kimi.com"),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
