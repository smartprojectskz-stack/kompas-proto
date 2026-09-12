"use client";

import { useState, useSyncExternalStore } from "react";
import { logoutAction } from "@/lib/actions/logout";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import { observationStageEmoji } from "@/lib/content";
import { isSoundEnabled, setSoundEnabled, subscribeSoundEnabled } from "@/lib/sound";
import type { AgeGroup } from "@/lib/types";

function useSoundEnabled() {
  return useSyncExternalStore(subscribeSoundEnabled, isSoundEnabled, () => true);
}

export default function ChildTopBar({
  childName,
  ageGroup,
  observationDays,
}: {
  childName: string;
  ageGroup: AgeGroup;
  observationDays: number;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const soundOn = useSoundEnabled();

  function toggleSound() {
    setSoundEnabled(!soundOn);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-sm text-[#8C8577] block">
          Привет, {childName} · {AGE_GROUP_LABEL[ageGroup]}
        </span>
        {observationDays > 0 && (
          <span className="text-[11px] text-[#8C8577]">
            {observationStageEmoji(observationDays)} Светлячок наблюдает за твоими днями уже{" "}
            {observationDays} {observationDays === 1 ? "день" : "дней"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSound}
          title={soundOn ? "Выключить звук" : "Включить звук"}
          className="text-base"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button
          onClick={() => setShowInfo(true)}
          className="text-xs text-[#8C8577] underline"
        >
          Для родителя
        </button>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-[#8C8577] underline">
            Выйти
          </button>
        </form>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-30">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 text-sm leading-relaxed">
            <h3 className="text-lg font-display font-semibold mb-3">🔒 Твои ответы — не отчёт</h3>
            <p className="mb-2 text-[#6E6659]">
              Родитель видит только общую динамику — без личных записей и без каждого
              отдельного ответа. Это не ежедневная проверка, а способ вовремя заметить,
              если тебе тяжело.
            </p>
            {ageGroup === "12-17" && (
              <p className="mb-2 text-[#6E6659]">
                Личные заметки в дневнике не показываются родителю целиком — только
                агрегированные тенденции. Исключение — прямой сигнал о безопасности.
              </p>
            )}
            <button
              onClick={() => setShowInfo(false)}
              className="btn-duo btn-duo-primary mt-4 w-full py-3"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
