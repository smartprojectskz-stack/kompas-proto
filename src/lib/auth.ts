import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { nanoid } from "nanoid";
import { dbGet, dbRun } from "./db";
import type { Role, SessionRecord, Parent, Child } from "./types";

const SESSION_COOKIE = "kompas_session";
const SESSION_DAYS = 30;

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = scryptSync(pin, salt, 64);
  const original = Buffer.from(hash, "hex");
  if (check.length !== original.length) return false;
  return timingSafeEqual(check, original);
}

export function generateFamilyCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function createSession(fields: {
  role: Role;
  family_id?: string | null;
  parent_id?: string | null;
  child_id?: string | null;
  admin_id?: string | null;
}) {
  const id = nanoid(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await dbRun(
    `INSERT INTO sessions (id, role, family_id, parent_id, child_id, admin_id, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      fields.role,
      fields.family_id ?? null,
      fields.parent_id ?? null,
      fields.child_id ?? null,
      fields.admin_id ?? null,
      expires.toISOString(),
    ]
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
  return id;
}

export async function createParentSession(parent: Parent) {
  return createSession({ role: "parent", family_id: parent.family_id, parent_id: parent.id });
}

export async function createChildSession(child: Child) {
  return createSession({ role: "child", family_id: child.family_id, child_id: child.id });
}

export async function createAdminSession(adminId: string) {
  return createSession({ role: "admin", admin_id: adminId });
}

export async function getSession(): Promise<SessionRecord | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const row = await dbGet<SessionRecord>(`SELECT * FROM sessions WHERE id = ?`, [id]);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await dbRun(`DELETE FROM sessions WHERE id = ?`, [id]);
    return null;
  }
  return row;
}

export async function destroySession() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (id) {
    await dbRun(`DELETE FROM sessions WHERE id = ?`, [id]);
    store.delete(SESSION_COOKIE);
  }
}

export async function requireParent(): Promise<{ session: SessionRecord; parent: Parent }> {
  const session = await getSession();
  if (!session || session.role !== "parent" || !session.parent_id) {
    throw new Error("UNAUTHORIZED");
  }
  const parent = await dbGet<Parent>(`SELECT * FROM parents WHERE id = ?`, [session.parent_id]);
  if (!parent) throw new Error("UNAUTHORIZED");
  return { session, parent };
}

export async function requireChild(): Promise<{ session: SessionRecord; child: Child }> {
  const session = await getSession();
  if (!session || session.role !== "child" || !session.child_id) {
    throw new Error("UNAUTHORIZED");
  }
  const child = await dbGet<Child>(`SELECT * FROM children WHERE id = ?`, [session.child_id]);
  if (!child) throw new Error("UNAUTHORIZED");
  return { session, child };
}

export async function requireAdmin(): Promise<SessionRecord> {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.admin_id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
