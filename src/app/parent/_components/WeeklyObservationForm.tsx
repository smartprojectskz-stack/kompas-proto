"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKLY_OBSERVATION_ITEMS_3_6, WEEKLY_OBSERVATION_SCALE } from "@/lib/checkinData";
import { submitWeeklyObservationAction } from "@/lib/actions/checkin";

export default function WeeklyObservationForm({
  childId,
  weekStart,
  onClose,
}: {
  childId: string;
  weekStart: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const complete = WEEKLY_OBSERVATION_ITEMS_3_6.every((i) => answers[i.key]);

  async function submit() {
    setSubmitting(true);
    await submitWeeklyObservationAction(childId, weekStart, answers);
    setSubmitting(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-30 px-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[var(--teal-dark)] mb-1">
          Еженедельное наблюдение
        </h3>
        <p className="text-xs text-[#9a9384] mb-4">
          Как часто это происходило на этой неделе?
        </p>
        <div className="flex flex-col gap-5">
          {WEEKLY_OBSERVATION_ITEMS_3_6.map((item) => (
            <div key={item.key}>
              <p className="text-sm text-[#22312e] mb-2">{item.label}</p>
              <div className="flex gap-1">
                {WEEKLY_OBSERVATION_SCALE.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, [item.key]: s.value }))}
                    title={s.label}
                    className={`flex-1 py-2 rounded-lg text-xs border-2 ${
                      answers[item.key] === s.value
                        ? "border-[var(--coral)] bg-[#FFF1EC]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white border border-[var(--line)] text-sm font-medium"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!complete || submitting}
            className="flex-1 py-3 rounded-xl bg-[var(--teal)] text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Отправляем…" : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
