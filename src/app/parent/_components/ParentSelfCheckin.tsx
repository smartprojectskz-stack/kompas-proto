"use client";

import { useEffect, useState } from "react";
import {
  submitParentCheckinAction,
  getTodayParentCheckinAction,
} from "@/lib/actions/parentCheckin";
import { getParentTip } from "@/lib/content";

const MOOD_EMOJI = ["😄", "🙂", "😐", "😔", "😣"];

export default function ParentSelfCheckin() {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    getTodayParentCheckinAction().then((row) => {
      if (row) setValue(row.mood_value);
      setLoaded(true);
    });
  }, []);

  async function choose(v: number) {
    setValue(v);
    await submitParentCheckinAction(v);
  }

  if (!loaded) return null;

  return (
    <div className="card-duo p-4 mb-4">
      <h3 className="text-sm font-display font-medium mb-2">А как вы сами сегодня?</h3>
      {value === null ? (
        <div className="flex gap-2">
          {MOOD_EMOJI.map((emoji, i) => (
            <button
              key={emoji}
              onClick={() => choose(i + 1)}
              className="flex-1 aspect-square rounded-xl border-2 border-[var(--line)] bg-white text-xl flex items-center justify-center active:translate-y-0.5 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#2E3550]">{getParentTip(value)}</p>
      )}
    </div>
  );
}
