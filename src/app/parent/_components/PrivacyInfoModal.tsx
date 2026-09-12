"use client";

import { PRIVACY_TABLE, PRIVACY_INTRO } from "@/lib/content";

export default function PrivacyInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-30 px-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-display font-semibold text-[var(--brand-dark)] mb-2">
          🔒 Приватность по умолчанию
        </h3>
        <p className="text-sm text-[#6E6659] mb-4">{PRIVACY_INTRO}</p>

        <div className="flex flex-col gap-2 mb-4">
          {PRIVACY_TABLE.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-2.5"
            >
              <span className="text-sm text-[#2E3550]">{row.label}</span>
              {row.parentSees === "yes" && <span className="text-lg">✅</span>}
              {row.parentSees === "no" && <span className="text-lg">❌</span>}
              {row.parentSees === "alert" && <span className="text-sm">🚨 Да</span>}
            </div>
          ))}
        </div>

        <p className="text-xs text-[#8C8577] mb-4">
          Исключение — прямой сигнал о безопасности: если ребёнок отвечает, что ему страшно
          оставаться с этим одному, вы узнаете сразу, без подробностей дневника.
        </p>

        <button onClick={onClose} className="btn-duo btn-duo-primary w-full py-3 text-sm">
          Понятно
        </button>
      </div>
    </div>
  );
}
