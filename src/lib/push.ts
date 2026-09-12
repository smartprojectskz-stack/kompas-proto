import webpush from "web-push";
import { nanoid } from "nanoid";
import { dbAll, dbRun } from "./db";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@svetlyachok.app";

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
  configured = true;
  return true;
}

export function pushConfigured(): boolean {
  return ensureConfigured();
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function saveSubscription(
  parentId: string,
  familyId: string,
  sub: PushSubscriptionInput
) {
  await dbRun(
    `INSERT INTO push_subscriptions (id, parent_id, family_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`,
    [nanoid(16), parentId, familyId, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );
}

export async function removeSubscription(endpoint: string) {
  await dbRun(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint]);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToFamily(familyId: string, payload: PushPayload) {
  if (!ensureConfigured()) return;
  const subs = await dbAll<{ id: string; endpoint: string; p256dh: string; auth: string }>(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE family_id = ?`,
    [familyId]
  );
  if (subs.length === 0) return;
  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number } | undefined)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // subscription expired or the browser revoked it — clean it up
          await dbRun(`DELETE FROM push_subscriptions WHERE id = ?`, [s.id]);
        }
      }
    })
  );
}
