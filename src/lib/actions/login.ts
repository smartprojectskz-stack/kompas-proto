"use server";

import { db } from "@/lib/db";
import { verifyPin, createParentSession, createChildSession, createAdminSession } from "@/lib/auth";
import type { Family, Parent, Child } from "@/lib/types";

export interface FamilyMembers {
  family: { id: string; name: string; code: string };
  parents: { id: string; name: string }[];
  children: { id: string; name: string; avatar: string; age_group: string; needsPin: boolean }[];
}

export async function lookupFamilyAction(code: string): Promise<FamilyMembers | null> {
  const normalized = code.trim().toUpperCase();
  const family = db.prepare(`SELECT * FROM families WHERE code = ?`).get(normalized) as
    | Family
    | undefined;
  if (!family) return null;
  const parents = db
    .prepare(`SELECT id, name FROM parents WHERE family_id = ?`)
    .all(family.id) as { id: string; name: string }[];
  const children = (
    db
      .prepare(`SELECT id, name, avatar, age_group, pin_hash FROM children WHERE family_id = ?`)
      .all(family.id) as (Pick<Child, "id" | "name" | "avatar" | "age_group"> & {
      pin_hash: string | null;
    })[]
  ).map((c) => ({
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
  const parent = db.prepare(`SELECT * FROM parents WHERE id = ?`).get(parentId) as
    | Parent
    | undefined;
  if (!parent || !verifyPin(pin, parent.pin_hash)) {
    return { ok: false, error: "Неверный PIN" };
  }
  await createParentSession(parent);
  return { ok: true };
}

export async function childLoginAction(childId: string, pin?: string): Promise<LoginResult> {
  const child = db.prepare(`SELECT * FROM children WHERE id = ?`).get(childId) as
    | Child
    | undefined;
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
  const admin = db.prepare(`SELECT * FROM admins WHERE login = ?`).get(login.trim()) as
    | { id: string; login: string; pin_hash: string }
    | undefined;
  if (!admin || !verifyPin(pin, admin.pin_hash)) {
    return { ok: false, error: "Неверный логин или PIN" };
  }
  await createAdminSession(admin.id);
  return { ok: true };
}
