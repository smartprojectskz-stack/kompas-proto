"use client";

import { useState } from "react";
import FireflyMascot from "@/components/FireflyMascot";
import { COMFORT_OPTIONS } from "@/lib/content";

export default function FireflyComfort({
  onClose,
  onOpenBreathing,
}: {
  onClose: () => void;
  onOpenBreathing: () => void;
}) {
  const [tip, setTip] = useState<string | null>(null);

  function choose(key: string) {
    if (key === "breathe") {
      onClose();
      onOpenBreathing();
      return;
    }
    const option = COMFORT_OPTIONS.find((o) => o.key === key);
    setTip(option?.tip ?? null);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-6">
      <div className="card-duo bg-white p-6 max-w-xs w-full text-center">
        <div className="flex justify-center mb-2">
          <FireflyMascot size={88} />
        </div>

        {!tip ? (
          <>
            <p className="font-playful font-bold text-[#463D2E] mb-5">
              Кажется, сегодня день был тяжеловат. Хочешь выбрать, что тебе сейчас поможет?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COMFORT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => choose(o.key)}
                  className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[var(--line)] bg-white px-3 py-3 active:translate-y-1 transition-transform"
                  style={{ boxShadow: "0 3px 0 var(--line)" }}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="text-xs font-medium text-[var(--brand-dark)]">{o.label}</span>
                </button>
              ))}
            </div>
            <button onClick={onClose} className="mt-4 text-xs text-[#8C8577] underline">
              Не сейчас
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-[#6E6659] mb-5">{tip}</p>
            <button onClick={onClose} className="btn-duo btn-duo-primary w-full py-3 text-sm">
              Хорошо
            </button>
          </>
        )}
      </div>
    </div>
  );
}
