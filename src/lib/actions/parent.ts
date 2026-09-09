"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { requireParent, hashPin } from "@/lib/auth";
import { calcAgeGroup } from "@/lib/ageGroup";
import type { AgeGroup } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface AddChildResult {
  ok: boolean;
  error?: string;
}

export async function addChildAction(
  name: string,
  birthDate: string,
  avatar: string,
  pin?: string
): Promise<AddChildResult> {
  const { parent } = await requireParent();
  if (!name.trim() || !birthDate) {
    return { ok: false, error: "Заполните имя и дату рождения" };
  }
  const group: AgeGroup = calcAgeGroup(birthDate);
  if (group === "12-17" && (!pin || !/^\d{4}$/.test(pin))) {
    return { ok: false, error: "Подростку 12-17 лет нужен собственный PIN из 4 цифр" };
  }
  db.prepare(
    `INSERT INTO children (id, family_id, name, birth_date, age_group, avatar, pin_hash) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(16),
    parent.family_id,
    name.trim(),
    birthDate,
    group,
    avatar || "🙂",
    group === "12-17" && pin ? hashPin(pin) : null
  );
  revalidatePath("/parent");
  return { ok: true };
}
