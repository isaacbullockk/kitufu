import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

vi.hoisted(() => {
  process.env.OWNER_EMAIL = "owner@example.com";
});

const store = vi.hoisted(() => new Map<string, any>());

vi.mock("./queries/users", () => ({
  findUserByUnionId: async (unionId: string) => store.get(unionId),
  upsertUser: async (data: any) => {
    store.set(data.unionId, { id: store.size + 1, role: "user", ...data });
  },
  touchLastSignIn: async () => {},
}));

import { createLoginHandler, createRegisterHandler } from "./auth";

function makeApp() {
  const app = new Hono();
  app.post("/api/auth/register", createRegisterHandler());
  app.post("/api/auth/login", createLoginHandler());
  return app;
}

function post(app: Hono, path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("local auth handlers", () => {
  beforeEach(() => store.clear());

  it("registers a new account and sets a session cookie", async () => {
    const res = await post(makeApp(), "/api/auth/register", {
      name: "Test Guest",
      email: "guest@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.user.email).toBe("guest@example.com");
    expect(data.user.role).toBe("user");
    expect(res.headers.get("set-cookie")).toContain("kimi_sid=");
    // password hash must never leave the server
    expect(JSON.stringify(data)).not.toContain("scrypt$");
    expect(JSON.stringify(data)).not.toContain("passwordHash");
  });

  it("rejects invalid email and short password", async () => {
    const app = makeApp();
    expect((await post(app, "/api/auth/register", { email: "nope", password: "password123" })).status).toBe(400);
    expect((await post(app, "/api/auth/register", { email: "a@b.co", password: "short" })).status).toBe(400);
  });

  it("rejects duplicate registration", async () => {
    const app = makeApp();
    await post(app, "/api/auth/register", { email: "dup@example.com", password: "password123" });
    const res = await post(app, "/api/auth/register", { email: "dup@example.com", password: "password123" });
    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    const app = makeApp();
    await post(app, "/api/auth/register", { email: "login@example.com", password: "password123" });
    const res = await post(app, "/api/auth/login", { email: "login@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("kimi_sid=");
  });

  it("rejects wrong password and unknown email with the same message", async () => {
    const app = makeApp();
    await post(app, "/api/auth/register", { email: "known@example.com", password: "password123" });
    const wrong = await post(app, "/api/auth/login", { email: "known@example.com", password: "wrong-password" });
    const unknown = await post(app, "/api/auth/login", { email: "nobody@example.com", password: "wrong-password" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(((await wrong.json()) as any).error).toBe(((await unknown.json()) as any).error);
  });

  it("rate-limits repeated login failures", async () => {
    const app = makeApp();
    await post(app, "/api/auth/register", { email: "rl@example.com", password: "password123" });
    let last = 0;
    for (let i = 0; i < 10; i++) {
      last = (await post(app, "/api/auth/login", { email: "rl@example.com", password: "bad-password" })).status;
    }
    expect(last).toBe(401);
    const blocked = await post(app, "/api/auth/login", { email: "rl@example.com", password: "bad-password" });
    expect(blocked.status).toBe(429);
  });

  it("promotes the owner email to admin", async () => {
    const res = await post(makeApp(), "/api/auth/register", {
      email: "owner@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(((await res.json()) as any).user.role).toBe("admin");
  });
});
