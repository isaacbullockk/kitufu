import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();
const port = parseInt(process.env.PORT || "3000");

// Health endpoint — Railway checks this
app.get("/api/health", (c) => c.json({ status: "ok", ts: Date.now() }));
app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));
app.get("/", (c) => c.json({ status: "ok", service: "kitufu", ts: Date.now() }));

// Ping endpoint
app.get("/api/trpc/ping", (c) => c.json({ ok: true, ts: Date.now() }));

serve({ fetch: app.fetch, port }, () => {
  console.log("Kitufu port " + port);
});

export default app;
