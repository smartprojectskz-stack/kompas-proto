"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { dbGet, dbBatch, type BatchStatement } from "@/lib/db";
import { hashPin, generateFamilyCode, createParentSession } from "@/lib/auth";
import { calcAgeGroup } from "@/lib/ageGroup";
import type { AgeGroup, Parent } from "@/lib/types";

export interface OnboardingChildInput {
  name: string;
  birthDate: string;
  avatar: string;
  pin?: string;
}

export interface CreateFamilyResult {
  ok: boolean;
  error?: string;
  familyCode?: string;
}

export async function createFamilyAction(
  familyName: string,
  parentName: string,
  parentPin: string,
  children: OnboardingChildInput[]
): Promise<CreateFamilyResult> {
  familyName = familyName.trim();
  parentName = parentName.trim();

  if (!familyName || !parentName) {
    return { ok: false, error: "Заполните название семьи и имя родителя" };
  }
  if (!/^\d{4}$/.test(parentPin)) {
    return { ok: false, error: "PIN родителя должен состоять из 4 цифр" };
  }
  if (children.length === 0) {
    return { ok: false, error: "Добавьте хотя бы одного ребёнка" };
  }
  for (const c of children) {
    if (!c.name.trim() || !c.birthDate) {
      return { ok: false, error: "У каждого ребёнка должны быть заполнены имя и дата рождения" };
    }
    const group = calcAgeGroup(c.birthDate);
    if (group === "12-17" && (!c.pin || !/^\d{4}$/.test(c.pin))) {
      return { ok: false, error: `${c.name}: подростку 12-17 лет нужен собственный PIN из 4 цифр` };
    }
  }

  const familyId = nanoid(16);
  let code = generateFamilyCode();
  // ensure uniqueness
  while (await dbGet(`SELECT id FROM families WHERE code = ?`, [code])) {
    code = generateFamilyCode();
  }

  const parentId = nanoid(16);

  const statements: BatchStatement[] = [
    { sql: `INSERT INTO families (id, code, name) VALUES (?, ?, ?)`, args: [familyId, code, familyName] },
    {
      sql: `INSERT INTO parents (id, family_id, name, pin_hash) VALUES (?, ?, ?, ?)`,
      args: [parentId, familyId, parentName, hashPin(parentPin)],
    },
  ];
  for (const c of children) {
    const group: AgeGroup = calcAgeGroup(c.birthDate);
    statements.push({
      sql: `INSERT INTO children (id, family_id, name, birth_date, age_group, avatar, pin_hash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nanoid(16),
        familyId,
        c.name.trim(),
        c.birthDate,
        group,
        c.avatar || "🙂",
        group === "12-17" && c.pin ? hashPin(c.pin) : null,
      ],
    });
  }
  await dbBatch(statements);

  const parent = await dbGet<Parent>(`SELECT * FROM parents WHERE id = ?`, [parentId]);
  if (parent) {
    await createParentSession(parent);
  }

  return { ok: true, familyCode: code };
}

export async function finishOnboardingAction() {
  redirect("/parent");
}
