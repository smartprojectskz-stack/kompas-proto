import type { Domain } from "./content";
import type { Child, Checkin } from "./types";
import {
  getWeeklyObservationForWeek,
  getMostRecentDilemmaPattern,
  getMostRecentBiweeklyReport,
  getRecentCheckins,
} from "./queries";
import { getCurrentWeekStart } from "./week";

export const OBSERVATION_DOMAIN_MAP: Record<string, Domain> = {
  sleep: "sleep_regulation",
  outbursts: "mood",
  social: "social",
  adaptability: "anxiety",
  sharing: "social",
};

export const REPORT_DOMAIN_MAP: Record<string, Domain> = {
  stress: "stress",
  anxiety: "anxiety",
  sleep: "sleep_regulation",
  control: "autonomy",
  social: "social",
};

export async function getDominantDomain(child: Child): Promise<Domain | null> {
  if (child.age_group === "3-6") {
    const week = await getWeeklyObservationForWeek(child.id, getCurrentWeekStart());
    if (!week) return null;
    const answers = JSON.parse(week.answers_json) as Record<string, number>;
    let maxKey: string | null = null;
    let maxVal = 0;
    for (const [k, v] of Object.entries(answers)) {
      if (v > maxVal) {
        maxVal = v;
        maxKey = k;
      }
    }
    if (!maxKey || maxVal < 3) return null;
    return OBSERVATION_DOMAIN_MAP[maxKey] ?? null;
  }

  if (child.age_group === "7-11") {
    const patterns = await getMostRecentDilemmaPattern(child.id, 5);
    if (patterns.length >= 3) {
      const concerning = patterns.filter(
        (p) => p.pattern === "avoidance" || p.pattern === "self_blame"
      ).length;
      if (concerning / patterns.length >= 0.5) return "social";
    }
    const checkins = await getRecentCheckins(child.id, 7);
    const hard = checkins.filter((c) => c.mood_value >= 4).length;
    if (hard >= 3) return "anxiety";
    return null;
  }

  // 12-17
  const report = await getMostRecentBiweeklyReport(child.id);
  if (!report) return null;
  const scores = JSON.parse(report.domain_scores_json) as Record<string, number>;
  let maxKey: string | null = null;
  let maxVal = 0;
  for (const [k, v] of Object.entries(scores)) {
    if (v > maxVal) {
      maxVal = v;
      maxKey = k;
    }
  }
  if (!maxKey || maxVal < 3) return null;
  return REPORT_DOMAIN_MAP[maxKey] ?? null;
}

export type TrendDirection = "up" | "down" | "flat";

/** "up" = improving (mood getting better), "down" = worsening. mood_value: 1 best .. 5 worst. */
export function getTrendDirection(checkins: Checkin[]): TrendDirection {
  if (checkins.length < 4) return "flat";
  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date));
  const half = Math.floor(sorted.length / 2);
  const first = sorted.slice(0, half);
  const second = sorted.slice(half);
  const avg = (arr: Checkin[]) => arr.reduce((s, c) => s + c.mood_value, 0) / arr.length;
  const diff = avg(first) - avg(second);
  if (diff > 0.4) return "up";
  if (diff < -0.4) return "down";
  return "flat";
}

export function getCheckinRate(checkins: Checkin[], days = 7): string {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const count = checkins.filter((c) => c.date >= cutoff).length;
  return `${Math.min(count, days)}/${days}`;
}

export type MoodChange = "better" | "worse" | "same" | "not_enough_data";

export interface WeekComparison {
  thisWeekCount: number;
  lastWeekCount: number;
  moodChange: MoodChange;
}

/** Compares the last 7 days against the 7 days before that. checkins should cover at least 14 days. */
export function getWeekComparison(checkins: Checkin[]): WeekComparison {
  const cutoff7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cutoff14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const thisWeek = checkins.filter((c) => c.date > cutoff7);
  const lastWeek = checkins.filter((c) => c.date > cutoff14 && c.date <= cutoff7);
  const avg = (arr: Checkin[]) =>
    arr.length ? arr.reduce((s, c) => s + c.mood_value, 0) / arr.length : null;
  const thisWeekAvg = avg(thisWeek);
  const lastWeekAvg = avg(lastWeek);
  let moodChange: MoodChange = "not_enough_data";
  if (thisWeekAvg !== null && lastWeekAvg !== null) {
    const diff = thisWeekAvg - lastWeekAvg;
    moodChange = diff < -0.4 ? "better" : diff > 0.4 ? "worse" : "same";
  }
  return { thisWeekCount: thisWeek.length, lastWeekCount: lastWeek.length, moodChange };
}

export interface WeekMapDay {
  date: string;
  weekday: string;
  value: number | null;
  isToday: boolean;
}

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

/** Last 7 calendar days (oldest first) with the child's mood_value for each, or null if no checkin. */
export function getWeekMap(checkins: Checkin[]): WeekMapDay[] {
  const byDate = new Map(checkins.map((c) => [c.date, c.mood_value]));
  const today = new Date();
  const days: WeekMapDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    days.push({
      date,
      weekday: WEEKDAY_SHORT[d.getDay()],
      value: byDate.get(date) ?? null,
      isToday: i === 0,
    });
  }
  return days;
}
