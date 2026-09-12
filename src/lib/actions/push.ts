"use server";

import { requireParent } from "@/lib/auth";
import { saveSubscription, removeSubscription, type PushSubscriptionInput } from "@/lib/push";

export async function subscribePushAction(sub: PushSubscriptionInput): Promise<{ ok: boolean }> {
  const { parent } = await requireParent();
  await saveSubscription(parent.id, parent.family_id, sub);
  return { ok: true };
}

export async function unsubscribePushAction(endpoint: string): Promise<{ ok: boolean }> {
  await requireParent();
  await removeSubscription(endpoint);
  return { ok: true };
}
