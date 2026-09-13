import { redirect } from "next/navigation";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getChildrenForFamily, getRecentCheckins, getAllAlertsForChild } from "@/lib/queries";
import { getDominantDomain, getTrendDirection, getCheckinRate } from "@/lib/insights";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import { DOMAIN_LABEL, ALERT_TYPE_LABEL, SAFETY_DISCLAIMER, moodValueEmoji } from "@/lib/content";
import ParentTopBar from "../_components/ParentTopBar";
import PrintButton from "../_components/PrintButton";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  let familyId: string;
  let parentName: string;
  try {
    const { parent } = await requireParent();
    familyId = parent.family_id;
    parentName = parent.name;
  } catch {
    redirect("/login");
  }

  const children = await getChildrenForFamily(familyId);
  if (children.length === 0) redirect("/parent");

  const params = await searchParams;
  const selectedChild = children.find((c) => c.id === params.child) ?? children[0];

  const checkins = (await getRecentCheckins(selectedChild.id, 30)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const dominantDomain = await getDominantDomain(selectedChild);
  const trend = getTrendDirection(checkins);
  const checkinRate = getCheckinRate(checkins, 30);
  const alerts = await getAllAlertsForChild(selectedChild.id);
  const periodStart = checkins.length ? checkins[checkins.length - 1].date : new Date().toISOString().slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="no-print">
        <ParentTopBar parentName={parentName} />
      </div>
      <div className="max-w-lg mx-auto w-full px-4 py-6">
        <Link href="/parent" className="text-xs text-[var(--brand)] underline mb-4 inline-block no-print">
          ← Назад в дашборд
        </Link>

        <h1 className="text-xl font-display font-semibold text-[var(--brand-dark)] mb-1">
          Отчёт для специалиста
        </h1>
        <p className="text-sm text-[#6E6659] mb-4">
          {selectedChild.name}, {AGE_GROUP_LABEL[selectedChild.age_group]} · период {periodStart} — {periodEnd}
        </p>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-3">Сводка</h3>
          <div className="flex flex-col gap-2 text-sm text-[#2E3550]">
            <div>Отметок за 30 дней: <b>{checkinRate}</b></div>
            <div>
              Тренд:{" "}
              <b>
                {trend === "up" ? "фон улучшается" : trend === "down" ? "стоит присмотреться" : "стабильно"}
              </b>
            </div>
            <div>
              Частая тема: <b>{dominantDomain ? DOMAIN_LABEL[dominantDomain] : "не выявлено"}</b>
            </div>
          </div>
        </div>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-3">Динамика по дням</h3>
          {checkins.length === 0 ? (
            <p className="text-sm text-[#6E6659]">Нет отметок за этот период.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {checkins.map((c) => (
                <div key={c.date} className="flex items-center justify-between text-sm border-b border-[var(--line)] last:border-b-0 py-1">
                  <span className="text-[#6E6659]">{c.date}</span>
                  <span>
                    {moodValueEmoji(c.mood_value)} {c.mood_value}/5
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-3">История сигналов</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-[#6E6659]">Сигналов не было.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {alerts.map((a) => (
                <div key={a.id} className="text-sm">
                  <span className="text-xs text-[#8C8577]">
                    {a.created_at.slice(0, 10)} · {ALERT_TYPE_LABEL[a.type] ?? a.type} ·{" "}
                    {a.status === "open" ? "открыт" : "решён"}
                  </span>
                  <p className="text-[#2E3550]">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-[#8C8577] leading-relaxed mb-6">{SAFETY_DISCLAIMER}</p>

        <div className="mb-8">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
