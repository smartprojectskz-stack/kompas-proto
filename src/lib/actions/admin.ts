"use server";

import { dbRun } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function resolveAlertAction(alertId: string): Promise<{ ok: boolean }> {
  const session = await requireAdmin();
  await dbRun(
    `UPDATE alerts SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ? WHERE id = ?`,
    [session.admin_id, alertId]
  );
  return { ok: true };
}
