import type { Domain } from "./content";
import type { Child, Checkin } from "./types";
import {
  getWeeklyObservationForWeek,
  getMostRecentDilemmaPattern,
  getMostRecentBiweeklyReport,
  getRecentCheckins,
} from "./queries";
import { getCurrentWeekStart } from "./week";

const OBSERVATION_DOMAIN_MAP: Record<string, Domain> = {
  sleep: "sleep_regulation",
  outbursts: "mood",
  social: "social",
  adaptability: "anxiety",
  sharing: "social",
};

const REPORT_DOMAIN_MAP: Record<string, Domain> = {
  stress: "stress",
  anxiety: "anxiety",
  sleep: "sleep_regulation",
  control: "autonomy",
  social: "social",
};

export function getDominantDomain(child: Child): Domain | null {
  if (child.age_group === "3-6") {
    const week = getWeeklyObservationForWeek(child.id, getCurrentWeekStart());
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
    const patterns = getMostRecentDilemmaPattern(child.id, 5);
    if (patterns.length >= 3) {
      const concerning = patterns.filter(
        (p) => p.pattern === "avoidance" || p.pattern === "self_blame"
      ).length;
      if (concerning / patterns.length >= 0.5) return "social";
    }
    const checkins = getRecentCheckins(child.id, 7);
    const hard = checkins.filter((c) => c.mood_value >= 4).length;
    if (hard >= 3) return "anxiety";
    return null;
  }

  // 12-17
  const report = getMostRecentBiweeklyReport(child.id);
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
