"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function resolveAlertAction(alertId: string): Promise<{ ok: boolean }> {
  const session = await requireAdmin();
  db.prepare(
    `UPDATE alerts SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ? WHERE id = ?`
  ).run(session.admin_id, alertId);
  return { ok: true };
}
