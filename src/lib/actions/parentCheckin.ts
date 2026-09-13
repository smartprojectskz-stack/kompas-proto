"use server";

import { nanoid } from "nanoid";
import { dbRun } from "@/lib/db";
import { requireParent } from "@/lib/auth";
import { getTodayParentCheckin } from "@/lib/queries";
import type { ParentCheckin } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function submitParentCheckinAction(moodValue: number): Promise<{ ok: boolean }> {
  const { parent } = await requireParent();
  await dbRun(
    `INSERT INTO parent_checkins (id, parent_id, family_id, date, mood_value) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(parent_id, date) DO UPDATE SET mood_value = excluded.mood_value`,
    [nanoid(16), parent.id, parent.family_id, today(), moodValue]
  );
  return { ok: true };
}

export async function getTodayParentCheckinAction(): Promise<ParentCheckin | undefined> {
  const { parent } = await requireParent();
  return getTodayParentCheckin(parent.id, today());
}
