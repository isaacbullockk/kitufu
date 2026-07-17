import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

export function serveStaticFiles(app: Hono) {
  // Serve built frontend assets
  app.use("/assets/*", serveStatic({ root: "./dist/public" }));
  // Serve images and other static files
  app.use("/*", serveStatic({ root: "./public" }));
  // SPA fallback — serve index.html for all non-API routes
  app.get("*", async (c, next) => {
    const path = c.req.path;
    if (path.startsWith("/api")) return next();
    return serveStatic({ path: "./dist/public/index.html" })(c, next);
  });
}
