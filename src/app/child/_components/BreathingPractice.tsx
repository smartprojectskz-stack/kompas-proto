"use client";

import { useEffect, useState } from "react";

export default function BreathingPractice({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p === "in" ? "out" : "in"));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 px-6">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center">
        <div
          className="mx-auto rounded-full bg-[var(--child-sky)] transition-all ease-in-out"
          style={{
            width: phase === "in" ? 140 : 70,
            height: phase === "in" ? 140 : 70,
            transitionDuration: "4000ms",
          }}
        />
        <p className="mt-6 font-playful text-lg font-bold text-[#4E4636]">
          {phase === "in" ? "Вдох…" : "Выдох…"}
        </p>
        <p className="text-xs text-[#9a9384] mt-2 mb-6">Дыши вместе с кругом ещё немного</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[var(--teal)] text-white text-sm font-medium"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
