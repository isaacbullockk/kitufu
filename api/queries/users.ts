import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };

  // Owner promotion at insert time: matching OWNER_UNION_ID (legacy OAuth) or
  // OWNER_EMAIL (local auth).
  const isOwner =
    (values.unionId && values.unionId === env.ownerUnionId) ||
    (values.email && env.ownerEmail !== "" && values.email.toLowerCase() === env.ownerEmail);

  if (values.role === undefined && isOwner) {
    values.role = "admin";
  }

  // Never update role on duplicate key — role changes must go through
  // promoteToAdmin so a caller can't escalate privileges via upsert data.
  const { role: _role, ...safeData } = data;
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...safeData,
  };

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function promoteToAdmin(unionId: string) {
  await getDb()
    .update(schema.users)
    .set({ role: "admin" })
    .where(eq(schema.users.unionId, unionId));
}

export async function touchLastSignIn(unionId: string) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.unionId, unionId));
}
