"use client";

import { useState, useTransition } from "react";
import { resolveAlertAction } from "@/lib/actions/admin";
import type { Alert } from "@/lib/types";

export interface RiskAlert extends Alert {
  child_name: string;
  family_name: string;
}

export default function RiskQueue({ alerts }: { alerts: RiskAlert[] }) {
  const [items, setItems] = useState(alerts);
  const [pending, startTransition] = useTransition();

  function resolve(id: string) {
    startTransition(async () => {
      await resolveAlertAction(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-[#6E6659]">Открытых сигналов риска сейчас нет.</p>;
  }

  return (
    <div className="flex flex-col">
      {items.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between gap-3 py-3 border-b border-[var(--line)] last:border-b-0"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  a.severity === "critical" ? "bg-[#FBEAE0] text-[#8A4A2A]" : "bg-[#F7EEDD] text-[#6E6659]"
                }`}
              >
                {a.severity === "critical" ? "Критично" : "Внимание"}
              </span>
              <span className="text-sm font-medium truncate">
                {a.family_name} — {a.child_name}
              </span>
            </div>
            <p className="text-xs text-[#6E6659] truncate">{a.message}</p>
          </div>
          <button
            onClick={() => resolve(a.id)}
            disabled={pending}
            className="flex-shrink-0 text-xs border border-[var(--line)] rounded-lg px-3 py-2 disabled:opacity-50"
          >
            Решено
          </button>
        </div>
      ))}
    </div>
  );
}
