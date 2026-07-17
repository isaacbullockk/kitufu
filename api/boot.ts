import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import type { HttpBindings } from "@hono/node-server";

const app = new Hono<{ Bindings: HttpBindings }>();

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", service: "kitufu", version: "1.0.0", ts: Date.now() }));

// Static assets (built JS/CSS from Vite)
app.use("/assets/*", serveStatic({ root: "./dist/public" }));

// Static files from public/
app.use("/*", serveStatic({ root: "./public" }));

// SPA fallback
app.get("*", async (c, next) => {
  if (c.req.path.startsWith("/api")) return next();
  try {
    const fs = await import("node:fs");
    const html = fs.readFileSync("./dist/public/index.html", "utf-8");
    return c.html(html);
  } catch {
    return c.json({ status: "ok", service: "kitufu", note: "frontend building" });
  }
});

export default app;

if (process.env.NODE_ENV === "production") {
  console.log("[BOOT] Kitufu MINIMAL starting...");
  console.log("[BOOT] PORT=" + process.env.PORT);

  try {
    const { serve } = await import("@hono/node-server");
    const port = parseInt(process.env.PORT || "3000");
    serve({ fetch: app.fetch, port }, () => {
      console.log("[BOOT] LISTENING on port " + port);
    });
  } catch (e: any) {
    console.error("[BOOT] FATAL:", e.message);
    process.exit(1);
  }
}
