import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
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

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Start server
if (process.env.NODE_ENV === "production") {
  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");

  // Start server IMMEDIATELY (healthcheck must pass)
  serve({ fetch: app.fetch, port }, () => {
    console.log("[BOOT] Kitufu server port " + port);
  });

  // Seed database in background (non-blocking, fire-and-forget)
  try {
    const { autoSeed } = await import("./auto-seed");
    autoSeed().then(() => console.log("[BOOT] Auto-seed done")).catch((e: any) => console.log("[BOOT] Auto-seed skipped:", e.message));
  } catch (e: any) {
    console.log("[BOOT] Auto-seed module not loaded:", e.message);
  }

  // Serve static files (frontend SPA)
  try {
    const { serveStaticFiles } = await import("./lib/vite");
    serveStaticFiles(app);
  } catch (e: any) {
    console.log("[BOOT] Static files not served:", e.message);
    // Fallback: serve index.html for SPA routes
    app.get("*", async (c, next) => {
      const path = c.req.path;
      if (path.startsWith("/api") || path.startsWith("/assets")) return next();
      try {
        const file = await import("node:fs").then(m => m.readFileSync("./dist/public/index.html", "utf-8"));
        return c.html(file);
      } catch {
        return c.json({ status: "ok", service: "kitufu", note: "frontend not built yet" }, 200);
      }
    });
  }
}
