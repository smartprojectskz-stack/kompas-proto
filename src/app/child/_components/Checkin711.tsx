"use client";

import { useEffect, useMemo, useState } from "react";
import { MOOD_OPTIONS_7_11, ROTATING_PROMPTS_7_11, DILEMMAS_7_11 } from "@/lib/checkinData";
import {
  submitDailyCheckinAction,
  getTodayCheckinAction,
  submitDilemmaResponseAction,
  getDueDilemmaIndexAction,
} from "@/lib/actions/checkin";
import BreathingPractice from "./BreathingPractice";
import FireflyComfort from "./FireflyComfort";

export default function Checkin711({ childName }: { childName: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showComfort, setShowComfort] = useState(false);

  const [dilemmaIdx, setDilemmaIdx] = useState<number | null>(null);
  const [dilemmaDone, setDilemmaDone] = useState(false);

  const prompt = useMemo(
    () => ROTATING_PROMPTS_7_11[new Date().getDate() % ROTATING_PROMPTS_7_11.length],
    []
  );

  useEffect(() => {
    getTodayCheckinAction().then((row) => {
      if (row) {
        setSelected(row.mood_key);
        setSubmitted(true);
      }
      setLoaded(true);
    });
    getDueDilemmaIndexAction().then((idx) => {
      if (idx !== null) setDilemmaIdx(idx % DILEMMAS_7_11.length);
    });
  }, []);

  const current = MOOD_OPTIONS_7_11.find((m) => m.key === selected) ?? null;

  async function choose(key: string) {
    const option = MOOD_OPTIONS_7_11.find((m) => m.key === key)!;
    setSelected(key);
    setSubmitted(true);
    await submitDailyCheckinAction(option.key, option.moodValue, promptAnswer || undefined);
    if (option.moodValue >= 4) setShowComfort(true);
  }

  async function chooseDilemma(pattern: "avoidance" | "aggression" | "assertive" | "self_blame") {
    if (dilemmaIdx === null) return;
    const dilemma = DILEMMAS_7_11[dilemmaIdx];
    await submitDilemmaResponseAction(dilemma.key, pattern);
    setDilemmaDone(true);
  }

  if (!loaded) return null;

  return (
    <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full font-playful">
      <h1 className="text-2xl font-bold text-[var(--brand-dark)] mb-6 text-center">
        Привет, {childName}! Как ты сегодня?
      </h1>

      <div className="card-duo p-4 mb-4">
        <div className="flex justify-between gap-2">
          {MOOD_OPTIONS_7_11.map((m) => (
            <button
              key={m.key}
              onClick={() => choose(m.key)}
              className="flex-1 aspect-square rounded-2xl border-2 text-2xl transition-transform active:translate-y-1"
              style={
                selected === m.key
                  ? { borderColor: "var(--glow)", background: "#FDECC7", boxShadow: "0 4px 0 var(--glow-dark)" }
                  : { borderColor: "var(--line)", background: "#fff", boxShadow: "0 4px 0 var(--line)" }
              }
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-[#8C8577] mt-2 font-sans">
          <span>Супер</span>
          <span>Так себе</span>
          <span>Тяжело</span>
        </div>

        {submitted && current && (
          <div className="mt-4 p-4 rounded-2xl bg-[#EFF4E9] text-[var(--brand-dark)] text-[15px] font-sans">
            {current.response}
          </div>
        )}

        {!submitted && (
          <div className="mt-4 font-sans">
            <label className="block text-xs text-[#8C8577] mb-1">{prompt} (необязательно)</label>
            <textarea
              className="w-full rounded-xl border border-[var(--line)] p-3 text-sm"
              rows={2}
              value={promptAnswer}
              onChange={(e) => setPromptAnswer(e.target.value)}
            />
          </div>
        )}
      </div>

      {dilemmaIdx !== null && !dilemmaDone && (
        <div className="card-duo p-4 mb-4 font-sans">
          <h3 className="font-playful text-base font-bold text-[var(--brand-dark)] mb-2">
            Маленькая история
          </h3>
          <p className="text-sm text-[#6E6659] mb-3">{DILEMMAS_7_11[dilemmaIdx].story}</p>
          <div className="flex flex-col gap-2">
            {DILEMMAS_7_11[dilemmaIdx].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => chooseDilemma(opt.pattern)}
                className="text-left bg-[#F7EEDD] border-2 border-[var(--line)] rounded-2xl px-4 py-3 active:translate-y-1 transition-transform"
                style={{ boxShadow: "0 3px 0 var(--line)" }}
              >
                <span className="block font-playful font-bold text-sm text-[var(--brand-dark)]">
                  {opt.text}
                </span>
                <span className="block text-xs text-[#6E6659]">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {dilemmaDone && (
        <div className="bg-[#EFF4E9] rounded-3xl p-4 mb-4 text-sm text-[var(--brand-dark)] font-sans text-center">
          Спасибо, что поделился(ась)! 🌟
        </div>
      )}

      <button
        onClick={() => setShowBreathing(true)}
        className="w-full bg-white border-2 border-[var(--line)] rounded-2xl px-4 py-3 text-left font-sans active:translate-y-1 transition-transform"
        style={{ boxShadow: "0 3px 0 var(--line)" }}
      >
        <span className="block font-playful font-bold text-sm text-[var(--brand-dark)]">
          Подыши со мной
        </span>
        <span className="block text-xs text-[#6E6659]">1 минута, чтобы успокоиться</span>
      </button>

      {showBreathing && <BreathingPractice onClose={() => setShowBreathing(false)} />}
      {showComfort && (
        <FireflyComfort
          onClose={() => setShowComfort(false)}
          onOpenBreathing={() => setShowBreathing(true)}
        />
      )}
    </div>
  );
}
