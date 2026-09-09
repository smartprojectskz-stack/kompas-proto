import { dbGet, dbAll } from "./db";
import type { Child, Checkin, Alert } from "./types";

export async function getChildrenForFamily(familyId: string): Promise<Child[]> {
  return dbAll<Child>(`SELECT * FROM children WHERE family_id = ? ORDER BY created_at ASC`, [
    familyId,
  ]);
}

export async function getChildById(childId: string): Promise<Child | undefined> {
  return dbGet<Child>(`SELECT * FROM children WHERE id = ?`, [childId]);
}

export async function getRecentCheckins(childId: string, days = 14): Promise<Checkin[]> {
  return dbAll<Checkin>(`SELECT * FROM checkins WHERE child_id = ? ORDER BY date DESC LIMIT ?`, [
    childId,
    days,
  ]);
}

export async function getOpenAlertsForChild(childId: string): Promise<Alert[]> {
  return dbAll<Alert>(
    `SELECT * FROM alerts WHERE child_id = ? AND status = 'open' ORDER BY created_at DESC`,
    [childId]
  );
}

export async function getOpenAlertsForFamily(familyId: string): Promise<Alert[]> {
  return dbAll<Alert>(
    `SELECT * FROM alerts WHERE family_id = ? AND status = 'open' ORDER BY created_at DESC`,
    [familyId]
  );
}

export async function getAllOpenAlerts(): Promise<
  (Alert & { child_name: string; family_name: string })[]
> {
  return dbAll(
    `SELECT alerts.*, children.name as child_name, families.name as family_name
     FROM alerts
     JOIN children ON children.id = alerts.child_id
     JOIN families ON families.id = alerts.family_id
     WHERE alerts.status = 'open'
     ORDER BY CASE alerts.severity WHEN 'critical' THEN 0 ELSE 1 END, alerts.created_at DESC`
  );
}

export async function getWeeklyObservationForWeek(childId: string, weekStart: string) {
  return dbGet<{ answers_json: string }>(
    `SELECT * FROM weekly_observations WHERE child_id = ? AND week_start = ?`,
    [childId, weekStart]
  );
}

export async function getMostRecentDilemmaPattern(childId: string, limit = 5) {
  return dbAll<{ pattern: string }>(
    `SELECT pattern FROM dilemma_responses WHERE child_id = ? ORDER BY date DESC LIMIT ?`,
    [childId, limit]
  );
}

export async function getMostRecentBiweeklyReport(childId: string) {
  return dbGet<{ domain_scores_json: string; period_start: string }>(
    `SELECT * FROM biweekly_reports WHERE child_id = ? ORDER BY period_start DESC LIMIT 1`,
    [childId]
  );
}

export interface AdminStats {
  familiesCount: number;
  childrenCount: number;
  checkinRateThisWeek: number; // 0-1
  openAlertsCount: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const familiesRow = await dbGet<{ c: number }>(`SELECT COUNT(*) as c FROM families`);
  const childrenRow = await dbGet<{ c: number }>(`SELECT COUNT(*) as c FROM children`);
  const openAlertsRow = await dbGet<{ c: number }>(
    `SELECT COUNT(*) as c FROM alerts WHERE status = 'open'`
  );
  const familiesCount = Number(familiesRow?.c ?? 0);
  const childrenCount = Number(childrenRow?.c ?? 0);
  const openAlertsCount = Number(openAlertsRow?.c ?? 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const withCheckinRow = await dbGet<{ c: number }>(
    `SELECT COUNT(DISTINCT child_id) as c FROM checkins WHERE date >= ?`,
    [weekAgo]
  );
  const childrenWithCheckin = Number(withCheckinRow?.c ?? 0);
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

export async function listFamilies(search?: string): Promise<FamilyRow[]> {
  const rows = await dbAll<FamilyRow>(
    `SELECT families.id, families.name, families.code, families.created_at,
      (SELECT COUNT(*) FROM children WHERE children.family_id = families.id) as childCount,
      (SELECT COUNT(*) FROM alerts WHERE alerts.family_id = families.id AND alerts.status = 'open') as openAlerts
     FROM families ORDER BY families.created_at DESC`
  );
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
}

export async function listChildrenWithFamily(): Promise<
  (Child & { family_name: string; openAlerts: number })[]
> {
  return dbAll(
    `SELECT children.*, families.name as family_name,
      (SELECT COUNT(*) FROM alerts WHERE alerts.child_id = children.id AND alerts.status = 'open') as openAlerts
     FROM children JOIN families ON families.id = children.family_id
     ORDER BY children.created_at DESC`
  );
}
