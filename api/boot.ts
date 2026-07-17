import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "@hono/node-server/serve-static";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.get("/api/health", (c) => c.json({ status: "ok", service: "kitufu", version: "1.0.0", ts: Date.now() }));

// tRPC API
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Static assets (built JS/CSS from Vite)
app.use("/assets/*", serveStatic({ root: "./dist/public" }));

// Static files from public/
app.use("/*", serveStatic({ root: "./public" }));

// SPA fallback — serve index.html for all non-API routes
app.get("*", async (c, next) => {
  const path = c.req.path;
  if (path.startsWith("/api")) return next();
  try {
    const fs = await import("node:fs");
    const html = fs.readFileSync("./dist/public/index.html", "utf-8");
    return c.html(html);
  } catch {
    return c.json({ status: "ok", service: "kitufu", note: "frontend building" });
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Start server in production
if (process.env.NODE_ENV === "production") {
  console.log("[BOOT] Kitufu starting... PORT=" + process.env.PORT);

  try {
    const { serve } = await import("@hono/node-server");
    const port = parseInt(process.env.PORT || "3000");

    serve({ fetch: app.fetch, port }, () => {
      console.log("[BOOT] Kitufu listening on port " + port);
    });
  } catch (e: any) {
    console.error("[BOOT] FATAL:", e.message);
    process.exit(1);
  }

  // Seed database in background
  setTimeout(async () => {
    try {
      const { autoSeed } = await import("./auto-seed");
      await autoSeed();
      console.log("[BOOT] Auto-seed done");
    } catch (e: any) {
      console.log("[BOOT] Auto-seed error:", e.message);
    }
  }, 100);
}
