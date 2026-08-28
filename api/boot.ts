import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler, createOAuthLoginHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { autoSeed } from "./auto-seed";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.get("/api/oauth/login", createOAuthLoginHandler());
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    service: "kitufu",
    version: "1.0.0",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? "unknown",
    ts: Date.now(),
  }),
);

// DB setup endpoint — manually trigger table creation
app.get("/api/db-setup", async (c) => {
  try {
    await autoSeed();
    return c.json({ success: true, message: "Database tables created and seeded" });
  } catch (e: any) {
    return c.json({ success: false, error: e.message, stack: e.stack }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({ endpoint: "/api/trpc", req: c.req.raw, router: appRouter, createContext });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (process.env.NODE_ENV === "production") {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  try { await autoSeed(); } catch (e: any) { console.error("[BOOT] Auto-seed:", e.message); }
  serveStaticFiles(app);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => console.log("Kitufu port " + port));
}
