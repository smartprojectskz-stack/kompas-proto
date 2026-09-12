"use client";

import { useEffect, useState } from "react";
import { subscribePushAction, unsubscribePushAction } from "@/lib/actions/push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0))).buffer;
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export default function NotificationSettings() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!VAPID_PUBLIC_KEY || typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      const existing = await reg?.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });
      const json = sub.toJSON();
      await subscribePushAction({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus("on");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePushAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") return null;

  return (
    <div className="card-duo p-4 mb-4">
      <h3 className="text-sm font-display font-medium mb-1">🔔 Уведомления</h3>
      {status === "unsupported" && (
        <p className="text-xs text-[#8C8577]">
          Этот браузер не поддерживает push-уведомления. Проверяйте дашборд вручную.
        </p>
      )}
      {status === "denied" && (
        <p className="text-xs text-[#8C8577]">
          Уведомления заблокированы в настройках браузера. Разрешите их для сайта, чтобы получать
          сигнал о безопасности сразу, не заходя в приложение.
        </p>
      )}
      {status === "off" && (
        <>
          <p className="text-sm text-[#6E6659] mb-3">
            Получайте уведомление на телефон, если Светлячок заметит сигнал, требующий внимания.
          </p>
          <button onClick={enable} disabled={busy} className="btn-duo btn-duo-primary w-full py-3 text-sm">
            {busy ? "Включаем…" : "Включить уведомления"}
          </button>
        </>
      )}
      {status === "on" && (
        <>
          <p className="text-sm text-[#4C7A46] mb-3">Уведомления включены на этом устройстве.</p>
          <button onClick={disable} disabled={busy} className="text-xs text-[#8C8577] underline">
            {busy ? "Выключаем…" : "Выключить"}
          </button>
        </>
      )}
    </div>
  );
}
