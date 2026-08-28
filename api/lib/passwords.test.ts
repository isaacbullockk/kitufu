import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, localUnionId } from "./passwords";

describe("passwords", () => {
  it("hashes and verifies a password", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const hash = hashPassword("right-password");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects a tampered hash", () => {
    const hash = hashPassword("secret123");
    const tampered = hash.replace(/.$/, "0");
    expect(verifyPassword("secret123", tampered)).toBe(false);
  });

  it("rejects malformed hashes", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "bcrypt$10$abcdef")).toBe(false);
  });

  it("produces unique salts", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("derives deterministic case-insensitive unionIds", () => {
    expect(localUnionId("Guest@Example.com")).toBe(localUnionId("guest@example.com"));
    expect(localUnionId("guest@example.com")).toMatch(/^local:[0-9a-f]{64}$/);
    expect(localUnionId("a@b.co")).not.toBe(localUnionId("c@d.co"));
  });
});
