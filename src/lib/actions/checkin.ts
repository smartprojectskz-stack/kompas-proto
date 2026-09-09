"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { requireChild } from "@/lib/auth";
import {
  evaluateMoodTrend,
  evaluateDilemmaPattern,
  evaluateWeeklyObservation,
  evaluateBiweeklyReport,
  evaluateGatekeeper,
} from "@/lib/escalation";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Daily check-in shared by all age groups (weather pictograms for 3-6, mood emoji for 7-11/12-17). */
export async function submitDailyCheckinAction(
  moodKey: string,
  moodValue: number,
  promptAnswer?: string,
  note?: string
): Promise<ActionResult> {
  const { child } = await requireChild();
  const date = today();
  await dbRun(
    `INSERT INTO checkins (id, child_id, date, mood_key, mood_value, note, prompt_answer)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(child_id, date) DO UPDATE SET mood_key = excluded.mood_key, mood_value = excluded.mood_value,
       note = excluded.note, prompt_answer = excluded.prompt_answer`,
    [nanoid(16), child.id, date, moodKey, moodValue, note ?? null, promptAnswer ?? null]
  );

  await evaluateMoodTrend(child.family_id, child.id);
  return { ok: true };
}

export async function hasCheckedInTodayAction(): Promise<boolean> {
  const { child } = await requireChild();
  const row = await dbGet(`SELECT id FROM checkins WHERE child_id = ? AND date = ?`, [
    child.id,
    today(),
  ]);
  return !!row;
}

export async function getTodayCheckinAction(): Promise<{ mood_key: string } | null> {
  const { child } = await requireChild();
  const row = await dbGet<{ mood_key: string }>(
    `SELECT mood_key FROM checkins WHERE child_id = ? AND date = ?`,
    [child.id, today()]
  );
  return row ?? null;
}

const DILEMMA_INTERVAL_DAYS = 14;
const BIWEEKLY_INTERVAL_DAYS = 14;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export async function getDueDilemmaIndexAction(): Promise<number | null> {
  const { child } = await requireChild();
  const last = await dbGet<{ date: string }>(
    `SELECT date FROM dilemma_responses WHERE child_id = ? ORDER BY date DESC LIMIT 1`,
    [child.id]
  );
  if (last && daysSince(last.date) < DILEMMA_INTERVAL_DAYS) return null;
  const row = await dbGet<{ c: number }>(
    `SELECT COUNT(*) as c FROM dilemma_responses WHERE child_id = ?`,
    [child.id]
  );
  return Number(row?.c ?? 0); // used as index into DILEMMAS_7_11 (mod length) by the caller
}

export async function getDueBiweeklyAction(): Promise<boolean> {
  const { child } = await requireChild();
  const last = await dbGet<{ period_start: string }>(
    `SELECT period_start FROM biweekly_reports WHERE child_id = ? ORDER BY period_start DESC LIMIT 1`,
    [child.id]
  );
  if (!last) return true;
  return daysSince(last.period_start) >= BIWEEKLY_INTERVAL_DAYS;
}

/** 7-11: mini-dilemma response. */
export async function submitDilemmaResponseAction(
  dilemmaKey: string,
  pattern: "avoidance" | "aggression" | "assertive" | "self_blame"
): Promise<ActionResult> {
  const { child } = await requireChild();
  await dbRun(
    `INSERT INTO dilemma_responses (id, child_id, date, dilemma_key, pattern) VALUES (?, ?, ?, ?, ?)`,
    [nanoid(16), child.id, today(), dilemmaKey, pattern]
  );
  await evaluateDilemmaPattern(child.family_id, child.id);
  return { ok: true };
}

/** Parent's weekly observation checklist for a 3-6 child. */
export async function submitWeeklyObservationAction(
  childId: string,
  weekStart: string,
  answers: Record<string, number>
): Promise<ActionResult> {
  const child = await dbGet<{ id: string; family_id: string }>(
    `SELECT * FROM children WHERE id = ?`,
    [childId]
  );
  if (!child) return { ok: false, error: "Ребёнок не найден" };
  await dbRun(
    `INSERT INTO weekly_observations (id, child_id, week_start, answers_json)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(child_id, week_start) DO UPDATE SET answers_json = excluded.answers_json`,
    [nanoid(16), childId, weekStart, JSON.stringify(answers)]
  );
  await evaluateWeeklyObservation(child.family_id, childId, answers);
  revalidatePath("/parent");
  return { ok: true };
}

/** 12-17: biweekly self-report on domains. */
export async function submitBiweeklyReportAction(
  periodStart: string,
  scores: Record<string, number>
): Promise<ActionResult> {
  const { child } = await requireChild();
  await dbRun(
    `INSERT INTO biweekly_reports (id, child_id, period_start, domain_scores_json)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(child_id, period_start) DO UPDATE SET domain_scores_json = excluded.domain_scores_json`,
    [nanoid(16), child.id, periodStart, JSON.stringify(scores)]
  );
  await evaluateBiweeklyReport(child.family_id, child.id, scores);
  return { ok: true };
}

/** 12-17: gatekeeper safety question. answer: 0 = no, 1 = yes. */
export async function submitGatekeeperAnswerAction(answer: 0 | 1): Promise<ActionResult> {
  const { child } = await requireChild();
  await dbRun(`INSERT INTO gatekeeper_answers (id, child_id, date, answer) VALUES (?, ?, ?, ?)`, [
    nanoid(16),
    child.id,
    today(),
    answer,
  ]);
  await evaluateGatekeeper(child.family_id, child.id, answer);
  return { ok: true };
}
