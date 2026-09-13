"use client";

import { useState } from "react";
import Link from "next/link";
import MoodChart, { type MoodPoint } from "./MoodChart";
import AddChildForm from "./AddChildForm";
import WeeklyObservationForm from "./WeeklyObservationForm";
import PrivacyInfoModal from "./PrivacyInfoModal";
import NotificationSettings from "./NotificationSettings";
import WeekMap from "./WeekMap";
import {
  DOMAIN_LABEL,
  SAFETY_DISCLAIMER,
  CRISIS_CONTACTS,
  getConversationStarter,
  getWeekComparisonText,
  type AdviceItem,
  type Domain,
} from "@/lib/content";
import type { Alert, AgeGroup } from "@/lib/types";
import type { TrendDirection, WeekComparison, WeekMapDay } from "@/lib/insights";

export interface DashboardChild {
  id: string;
  name: string;
  avatar: string;
  age_group: AgeGroup;
}

export interface ParentDashboardData {
  children: DashboardChild[];
  selectedChild: DashboardChild;
  familyCode: string;
  familyName: string;
  moodPoints: MoodPoint[];
  checkinRate: string;
  trend: TrendDirection;
  weekComparison: WeekComparison;
  weekMap: WeekMapDay[];
  alerts: Alert[];
  recommendations: AdviceItem[];
  dominantDomain: Domain | null;
  weekStart: string;
  weeklyObservationDone: boolean;
}

export default function ParentDashboard({ data }: { data: ParentDashboardData }) {
  const [showAddChild, setShowAddChild] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const critical = data.alerts.find((a) => a.severity === "critical");
  const warnings = data.alerts.filter((a) => a.severity !== "critical");
  const conversationStarter = getConversationStarter(data.selectedChild.age_group);
  const weekComparisonText = getWeekComparisonText(
    data.weekComparison.moodChange,
    data.weekComparison.thisWeekCount,
    data.weekComparison.lastWeekCount
  );

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {data.children.map((c) => {
          const isSelected = c.id === data.selectedChild.id;
          return (
            <Link
              key={c.id}
              href={`/parent?child=${c.id}`}
              className="px-3 py-2 rounded-full text-sm font-medium border-2 transition-transform active:translate-y-0.5"
              style={
                isSelected
                  ? { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)", boxShadow: "0 3px 0 var(--brand-dark)" }
                  : { background: "#fff", color: "var(--ink)", borderColor: "var(--line)", boxShadow: "0 3px 0 var(--line)" }
              }
            >
              {c.avatar} {c.name}
            </Link>
          );
        })}
        <button
          onClick={() => setShowAddChild(true)}
          className="px-3 py-2 rounded-full text-sm font-medium border-2 border-dashed border-[var(--line)] text-[var(--brand)]"
        >
          + Ребёнок
        </button>
      </div>
      <p className="text-xs text-[#8C8577] mb-5">
        {data.familyName} · код семьи {data.familyCode} ·{" "}
        <button onClick={() => setShowPrivacy(true)} className="underline">
          🔒 приватность
        </button>
      </p>

      <NotificationSettings />

      {critical && (
        <div className="mb-4 bg-[#FBEAE0] border-2 border-[#E9A387] rounded-2xl p-4">
          <b className="block font-display text-[#7A3D20] mb-1">Требуется немедленное внимание</b>
          <p className="text-sm text-[#8A4A2A] mb-3">{critical.message}</p>
          <div className="flex flex-col gap-2">
            {CRISIS_CONTACTS.map((c) => (
              <div key={c.name} className="text-xs text-[#7A3D20]">
                <b>{c.phone}</b> — {c.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.map((a) => (
        <div key={a.id} className="mb-4 bg-[#FBEAE0] border-2 border-[#E8C3A6] rounded-2xl p-4">
          <b className="block font-display text-[#7A3D20] mb-1">Стоит обратить внимание</b>
          <p className="text-sm text-[#8A4A2A]">{a.message}</p>
        </div>
      ))}

      <div className="card-duo p-4 mb-4">
        <h3 className="text-sm font-display font-medium mb-1">Эмоциональный фон · 14 дней</h3>
        <MoodChart points={data.moodPoints} />
        <div className="flex justify-between text-[11px] text-[#8C8577] mt-1 mb-3">
          <span>2 недели назад</span>
          <span>сегодня</span>
        </div>
        <WeekMap days={data.weekMap} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatBox num={data.checkinRate} label="дней с чек-ином" />
        <StatBox
          num={data.dominantDomain ? DOMAIN_LABEL[data.dominantDomain] : "—"}
          label="частая тема недели"
        />
        <StatBox
          num={data.trend === "up" ? "↑" : data.trend === "down" ? "↓" : "→"}
          label={
            data.trend === "up" ? "фон улучшается" : data.trend === "down" ? "стоит присмотреться" : "стабильно"
          }
        />
      </div>

      <div className="card-duo p-4 mb-4">
        <h3 className="text-sm font-display font-medium mb-2">Что изменилось за неделю</h3>
        <p className="text-sm text-[#2E3550]">{weekComparisonText}</p>
      </div>

      <div className="card-duo p-4 mb-4">
        <h3 className="text-sm font-display font-medium mb-2">💬 Разговор дня</h3>
        <p className="text-sm text-[#2E3550]">Сегодня можно спросить: «{conversationStarter}»</p>
      </div>

      {data.selectedChild.age_group === "3-6" && (
        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-2">Еженедельное наблюдение</h3>
          {data.weeklyObservationDone ? (
            <p className="text-sm text-[#6E6659]">Анкета за эту неделю уже заполнена. Спасибо!</p>
          ) : (
            <>
              <p className="text-sm text-[#6E6659] mb-3">
                В 3–6 лет основной источник сигналов — наблюдение родителя. Уделите минуту короткому
                чек-листу за эту неделю.
              </p>
              <button onClick={() => setShowWeekly(true)} className="btn-duo btn-duo-primary w-full py-3 text-sm">
                Заполнить анкету
              </button>
            </>
          )}
        </div>
      )}

      <div className="card-duo p-4 mb-4">
        <h3 className="text-sm font-display font-medium mb-2">Рекомендации на сегодня</h3>
        {data.recommendations.map((r, i) => (
          <div key={r.title} className="flex gap-3 py-3 border-b border-[var(--line)] last:border-b-0">
            <div className="w-6 h-6 rounded-full bg-[var(--sage)] text-white text-xs font-display flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <b className="block text-sm">{r.title}</b>
              <span className="text-xs text-[#6E6659]">{r.text}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#8C8577] text-center leading-relaxed">{SAFETY_DISCLAIMER}</p>

      {showAddChild && <AddChildForm onClose={() => setShowAddChild(false)} />}
      {showPrivacy && <PrivacyInfoModal onClose={() => setShowPrivacy(false)} />}
      {showWeekly && (
        <WeeklyObservationForm
          childId={data.selectedChild.id}
          weekStart={data.weekStart}
          onClose={() => setShowWeekly(false)}
        />
      )}
    </div>
  );
}

function StatBox({ num, label }: { num: string; label: string }) {
  return (
    <div className="bg-[#F7EEDD] border-2 border-[var(--line)] rounded-xl p-3 text-center">
      <div className="font-display text-lg text-[var(--brand-dark)] leading-tight">{num}</div>
      <div className="text-[11px] text-[#8C8577] mt-1">{label}</div>
    </div>
  );
}
