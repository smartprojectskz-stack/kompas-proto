"use client";

import { useEffect, useState } from "react";
import {
  MOOD_SCALE_12_17_LABELS,
  moodValue7to5,
  GATEKEEPER_QUESTION,
  BIWEEKLY_DOMAINS_12_17,
} from "@/lib/checkinData";
import {
  submitDailyCheckinAction,
  getTodayCheckinAction,
  getDueBiweeklyAction,
  submitGatekeeperAnswerAction,
  submitBiweeklyReportAction,
} from "@/lib/actions/checkin";
import BreathingPractice from "./BreathingPractice";
import CrisisScreen from "./CrisisScreen";

export default function Checkin1217({ childName }: { childName: string }) {
  void childName;
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  const [biweeklyDue, setBiweeklyDue] = useState(false);
  const [gatekeeperAnswered, setGatekeeperAnswered] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [domainScores, setDomainScores] = useState<Record<string, number>>({});
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    getTodayCheckinAction().then((row) => {
      if (row) {
        setSelected(Number(row.mood_key));
        setSubmitted(true);
      }
      setLoaded(true);
    });
    getDueBiweeklyAction().then(setBiweeklyDue);
  }, []);

  async function choose(scaleValue: number) {
    setSelected(scaleValue);
    setSubmitted(true);
    await submitDailyCheckinAction(String(scaleValue), moodValue7to5(scaleValue), undefined, note || undefined);
  }

  async function answerGatekeeper(yes: boolean) {
    await submitGatekeeperAnswerAction(yes ? 1 : 0);
    setGatekeeperAnswered(true);
    if (yes) setCrisis(true);
  }

  async function submitDomains() {
    const periodStart = new Date().toISOString().slice(0, 10);
    await submitBiweeklyReportAction(periodStart, domainScores);
    setReportDone(true);
  }

  if (!loaded) return null;
  if (crisis) return <CrisisScreen />;

  return (
    <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-display font-semibold text-[var(--brand-dark)] mb-6 text-center">
        Как ты сегодня?
      </h1>

      <div className="card-duo p-4 mb-5">
        <div className="grid grid-cols-7 gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((v) => (
            <button
              key={v}
              onClick={() => choose(v)}
              className={`aspect-square rounded-xl text-sm font-medium border-2 ${
                selected === v ? "border-[var(--glow)] bg-[#FDECC7]" : "border-[var(--line)] bg-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-[#8C8577] mt-2">
          <span>{MOOD_SCALE_12_17_LABELS[0]}</span>
          <span>{MOOD_SCALE_12_17_LABELS[6]}</span>
        </div>

        {!submitted && (
          <div className="mt-4">
            <label className="block text-xs text-[#8C8577] mb-1">
              Личная заметка (необязательно, видна только тебе)
            </label>
            <textarea
              className="w-full rounded-xl border border-[var(--line)] p-3 text-sm"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
        {submitted && (
          <p className="mt-4 text-sm text-[var(--brand-dark)] bg-[#EFF4E9] rounded-xl p-3">
            Спасибо, что отметил(а). Заметка остаётся только твоей.
          </p>
        )}
      </div>

      <button
        onClick={() => setShowBreathing(true)}
        className="w-full bg-white border-2 border-[var(--line)] rounded-2xl px-4 py-3 text-left mb-5 active:translate-y-1 transition-transform"
        style={{ boxShadow: "0 3px 0 var(--line)" }}
      >
        <span className="block font-medium text-sm text-[var(--brand-dark)]">Подыши со мной</span>
        <span className="block text-xs text-[#6E6659]">1 минута, чтобы снизить накал</span>
      </button>

      {biweeklyDue && !reportDone && (
        <div className="card-duo p-4">
          <h3 className="font-display font-medium text-base text-[var(--brand-dark)] mb-3">
            Короткий отчёт за две недели
          </h3>

          {!gatekeeperAnswered && (
            <div>
              <p className="text-sm text-[#6E6659] mb-4">{GATEKEEPER_QUESTION}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => answerGatekeeper(false)}
                  className="btn-duo flex-1 py-3"
                  style={{ background: "#EFF4E9", color: "var(--brand-dark)", boxShadow: "0 4px 0 var(--sage-dark)" }}
                >
                  Нет
                </button>
                <button
                  onClick={() => answerGatekeeper(true)}
                  className="btn-duo flex-1 py-3"
                  style={{ background: "#FBEAE0", color: "#8A4A2A", boxShadow: "0 4px 0 #E8C3A6" }}
                >
                  Да
                </button>
              </div>
            </div>
          )}

          {gatekeeperAnswered && !reportDone && (
            <div className="flex flex-col gap-4">
              {BIWEEKLY_DOMAINS_12_17.map((d) => (
                <div key={d.key}>
                  <p className="text-sm text-[#6E6659] mb-2">{d.question}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setDomainScores((prev) => ({ ...prev, [d.key]: v }))}
                        className={`flex-1 py-2 rounded-lg text-sm border-2 ${
                          domainScores[d.key] === v
                            ? "border-[var(--glow)] bg-[#FDECC7]"
                            : "border-[var(--line)] bg-white"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={submitDomains}
                disabled={Object.keys(domainScores).length < BIWEEKLY_DOMAINS_12_17.length}
                className="btn-duo btn-duo-primary w-full py-3"
              >
                Отправить
              </button>
            </div>
          )}
        </div>
      )}
      {reportDone && (
        <div className="bg-[#EFF4E9] rounded-3xl p-4 text-sm text-[var(--brand-dark)] text-center">
          Спасибо за честные ответы 🌿
        </div>
      )}

      {showBreathing && <BreathingPractice onClose={() => setShowBreathing(false)} />}
    </div>
  );
}
