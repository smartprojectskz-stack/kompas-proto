"use server";

import { dbGet, dbAll } from "@/lib/db";
import { verifyPin, createParentSession, createChildSession, createAdminSession } from "@/lib/auth";
import type { Family, Parent, Child } from "@/lib/types";

export interface FamilyMembers {
  family: { id: string; name: string; code: string };
  parents: { id: string; name: string }[];
  children: { id: string; name: string; avatar: string; age_group: string; needsPin: boolean }[];
}

export async function lookupFamilyAction(code: string): Promise<FamilyMembers | null> {
  const normalized = code.trim().toUpperCase();
  const family = await dbGet<Family>(`SELECT * FROM families WHERE code = ?`, [normalized]);
  if (!family) return null;
  const parents = await dbAll<{ id: string; name: string }>(
    `SELECT id, name FROM parents WHERE family_id = ?`,
    [family.id]
  );
  const childrenRows = await dbAll<
    Pick<Child, "id" | "name" | "avatar" | "age_group"> & { pin_hash: string | null }
  >(`SELECT id, name, avatar, age_group, pin_hash FROM children WHERE family_id = ?`, [family.id]);
  const children = childrenRows.map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    age_group: c.age_group,
    needsPin: !!c.pin_hash,
  }));
  return {
    family: { id: family.id, name: family.name, code: family.code },
    parents,
    children,
  };
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export async function parentLoginAction(parentId: string, pin: string): Promise<LoginResult> {
  const parent = await dbGet<Parent>(`SELECT * FROM parents WHERE id = ?`, [parentId]);
  if (!parent || !verifyPin(pin, parent.pin_hash)) {
    return { ok: false, error: "Неверный PIN" };
  }
  await createParentSession(parent);
  return { ok: true };
}

export async function childLoginAction(childId: string, pin?: string): Promise<LoginResult> {
  const child = await dbGet<Child>(`SELECT * FROM children WHERE id = ?`, [childId]);
  if (!child) return { ok: false, error: "Профиль не найден" };
  if (child.pin_hash) {
    if (!pin || !verifyPin(pin, child.pin_hash)) {
      return { ok: false, error: "Неверный PIN" };
    }
  }
  await createChildSession(child);
  return { ok: true };
}

export async function adminLoginAction(login: string, pin: string): Promise<LoginResult> {
  const admin = await dbGet<{ id: string; login: string; pin_hash: string }>(
    `SELECT * FROM admins WHERE login = ?`,
    [login.trim()]
  );
  if (!admin || !verifyPin(pin, admin.pin_hash)) {
    return { ok: false, error: "Неверный логин или PIN" };
  }
  await createAdminSession(admin.id);
  return { ok: true };
}
