import { db } from "./db";
import type { Child, Checkin, Alert } from "./types";

export function getChildrenForFamily(familyId: string): Child[] {
  return db
    .prepare(`SELECT * FROM children WHERE family_id = ? ORDER BY created_at ASC`)
    .all(familyId) as Child[];
}

export function getChildById(childId: string): Child | undefined {
  return db.prepare(`SELECT * FROM children WHERE id = ?`).get(childId) as Child | undefined;
}

export function getRecentCheckins(childId: string, days = 14): Checkin[] {
  return db
    .prepare(
      `SELECT * FROM checkins WHERE child_id = ? ORDER BY date DESC LIMIT ?`
    )
    .all(childId, days) as Checkin[];
}

export function getOpenAlertsForChild(childId: string): Alert[] {
  return db
    .prepare(`SELECT * FROM alerts WHERE child_id = ? AND status = 'open' ORDER BY created_at DESC`)
    .all(childId) as Alert[];
}

export function getOpenAlertsForFamily(familyId: string): Alert[] {
  return db
    .prepare(`SELECT * FROM alerts WHERE family_id = ? AND status = 'open' ORDER BY created_at DESC`)
    .all(familyId) as Alert[];
}

export function getAllOpenAlerts(): (Alert & { child_name: string; family_name: string })[] {
  return db
    .prepare(
      `SELECT alerts.*, children.name as child_name, families.name as family_name
       FROM alerts
       JOIN children ON children.id = alerts.child_id
       JOIN families ON families.id = alerts.family_id
       WHERE alerts.status = 'open'
       ORDER BY CASE alerts.severity WHEN 'critical' THEN 0 ELSE 1 END, alerts.created_at DESC`
    )
    .all() as (Alert & { child_name: string; family_name: string })[];
}

export function getWeeklyObservationForWeek(childId: string, weekStart: string) {
  return db
    .prepare(`SELECT * FROM weekly_observations WHERE child_id = ? AND week_start = ?`)
    .get(childId, weekStart) as { answers_json: string } | undefined;
}

export function getMostRecentDilemmaPattern(childId: string, limit = 5) {
  return db
    .prepare(
      `SELECT pattern FROM dilemma_responses WHERE child_id = ? ORDER BY date DESC LIMIT ?`
    )
    .all(childId, limit) as { pattern: string }[];
}

export function getMostRecentBiweeklyReport(childId: string) {
  return db
    .prepare(
      `SELECT * FROM biweekly_reports WHERE child_id = ? ORDER BY period_start DESC LIMIT 1`
    )
    .get(childId) as { domain_scores_json: string; period_start: string } | undefined;
}

export interface AdminStats {
  familiesCount: number;
  childrenCount: number;
  checkinRateThisWeek: number; // 0-1
  openAlertsCount: number;
}

export function getAdminStats(): AdminStats {
  const familiesCount = (db.prepare(`SELECT COUNT(*) as c FROM families`).get() as { c: number }).c;
  const childrenCount = (db.prepare(`SELECT COUNT(*) as c FROM children`).get() as { c: number }).c;
  const openAlertsCount = (
    db.prepare(`SELECT COUNT(*) as c FROM alerts WHERE status = 'open'`).get() as { c: number }
  ).c;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const childrenWithCheckin = (
    db
      .prepare(`SELECT COUNT(DISTINCT child_id) as c FROM checkins WHERE date >= ?`)
      .get(weekAgo) as { c: number }
  ).c;
  const checkinRateThisWeek = childrenCount > 0 ? childrenWithCheckin / childrenCount : 0;

  return { familiesCount, childrenCount, checkinRateThisWeek, openAlertsCount };
}

export interface FamilyRow {
  id: string;
  name: string;
  code: string;
  created_at: string;
  childCount: number;
  openAlerts: number;
}

export function listFamilies(search?: string): FamilyRow[] {
  const rows = db
    .prepare(
      `SELECT families.id, families.name, families.code, families.created_at,
        (SELECT COUNT(*) FROM children WHERE children.family_id = families.id) as childCount,
        (SELECT COUNT(*) FROM alerts WHERE alerts.family_id = families.id AND alerts.status = 'open') as openAlerts
       FROM families ORDER BY families.created_at DESC`
    )
    .all() as FamilyRow[];
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
}

export function listChildrenWithFamily(): (Child & { family_name: string; openAlerts: number })[] {
  return db
    .prepare(
      `SELECT children.*, families.name as family_name,
        (SELECT COUNT(*) FROM alerts WHERE alerts.child_id = children.id AND alerts.status = 'open') as openAlerts
       FROM children JOIN families ON families.id = children.family_id
       ORDER BY children.created_at DESC`
    )
    .all() as (Child & { family_name: string; openAlerts: number })[];
}
