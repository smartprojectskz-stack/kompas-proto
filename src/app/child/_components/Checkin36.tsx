"use client";

import { useEffect, useState } from "react";
import { WEATHER_OPTIONS } from "@/lib/checkinData";
import { submitDailyCheckinAction, getTodayCheckinAction } from "@/lib/actions/checkin";
import { getAffirmation } from "@/lib/content";
import { playPop } from "@/lib/sound";

export default function Checkin36({ childName }: { childName: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const affirmation = getAffirmation("3-6");

  useEffect(() => {
    getTodayCheckinAction().then((row) => {
      if (row) {
        setSelected(row.mood_key);
        setShowResponse(true);
      }
      setLoaded(true);
    });
  }, []);

  const current = WEATHER_OPTIONS.find((w) => w.key === selected) ?? null;

  async function choose(key: string) {
    const option = WEATHER_OPTIONS.find((w) => w.key === key)!;
    playPop();
    setSelected(key);
    setShowResponse(true);
    await submitDailyCheckinAction(option.key, option.moodValue);
  }

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance("Какая сегодня погода внутри тебя?");
    utter.lang = "ru-RU";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  if (!loaded) return null;

  return (
    <div
      className="flex-1 flex flex-col transition-colors duration-300"
      style={{ background: showResponse && current ? current.bg : "var(--child-bg)" }}
    >
      {!showResponse && (
        <>
          <div className="flex justify-center px-4 pt-2">
            <button
              onClick={speak}
              className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-xl"
              title="Озвучить вопрос"
            >
              🔊
            </button>
          </div>
          <div className="text-center px-4 pt-4 pb-6 font-playful text-2xl font-extrabold text-[#463D2E]">
            Какая сегодня погода внутри тебя, {childName}?
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 px-5 pb-8 max-w-md mx-auto w-full">
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w.key}
                onClick={() => choose(w.key)}
                className="rounded-[28px] flex items-center justify-center text-6xl active:translate-y-1 transition-transform"
                style={{
                  background: weatherButtonColor(w.key),
                  boxShadow: `0 5px 0 ${weatherShadowColor(w.key)}`,
                }}
              >
                {w.emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {showResponse && current && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-8xl mb-6">{current.emoji}</div>
          <div className="font-playful text-xl font-bold text-[#463D2E] max-w-xs mb-3">
            {current.response}
          </div>
          <p className="text-sm text-[#6E6659] max-w-xs mb-8 italic">{affirmation}</p>
          <button
            onClick={() => setShowResponse(false)}
            className="rounded-full bg-white px-6 py-3 font-playful font-bold text-sm shadow-[0_3px_0_rgba(0,0,0,0.06)] text-[#463D2E]"
          >
            Выбрать ещё раз
          </button>
        </div>
      )}
    </div>
  );
}

function weatherButtonColor(key: string): string {
  switch (key) {
    case "sun":
      return "var(--sun)";
    case "cloud":
      return "var(--child-sky)";
    case "rainbow":
      return "var(--leaf)";
    case "storm":
      return "var(--storm)";
    default:
      return "#FFFDF8";
  }
}

function weatherShadowColor(key: string): string {
  switch (key) {
    case "sun":
      return "var(--glow-dark)";
    case "cloud":
      return "#7C93B5";
    case "rainbow":
      return "var(--sage-dark)";
    case "storm":
      return "#6E699A";
    default:
      return "#E6D9BE";
  }
}
