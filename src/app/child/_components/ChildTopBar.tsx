"use client";

import { useState } from "react";
import { logoutAction } from "@/lib/actions/logout";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import type { AgeGroup } from "@/lib/types";

export default function ChildTopBar({
  childName,
  ageGroup,
}: {
  childName: string;
  ageGroup: AgeGroup;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#8C8577]">
        Привет, {childName} · {AGE_GROUP_LABEL[ageGroup]}
      </span>
      <div className="flex items-center gap-3">
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
            <h3 className="text-lg font-semibold mb-3">Что видит родитель</h3>
            <p className="mb-2 text-[#6E6659]">
              Ответы ребёнка попадают в дашборд родителя как сигналы динамики — без личных
              записей и оценок.
            </p>
            {ageGroup === "12-17" && (
              <p className="mb-2 text-[#6E6659]">
                Личные заметки в дневнике не показываются родителю целиком — только
                агрегированные тенденции. Исключение — прямой сигнал о безопасности.
              </p>
            )}
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full py-3 rounded-xl bg-[var(--brand-dark)] text-white"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
