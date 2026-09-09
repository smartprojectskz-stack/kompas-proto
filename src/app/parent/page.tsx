import { redirect } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { dbGet } from "@/lib/db";
import {
  getChildrenForFamily,
  getRecentCheckins,
  getOpenAlertsForChild,
  getWeeklyObservationForWeek,
} from "@/lib/queries";
import { getDominantDomain, getTrendDirection, getCheckinRate } from "@/lib/insights";
import { getRecommendations } from "@/lib/content";
import { getCurrentWeekStart } from "@/lib/week";
import ParentDashboard, { type ParentDashboardData } from "./_components/ParentDashboard";
import ParentTopBar from "./_components/ParentTopBar";
import type { Family } from "@/lib/types";

export default async function ParentPage({
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

  const family = await dbGet<Family>(`SELECT * FROM families WHERE id = ?`, [familyId]);
  const children = await getChildrenForFamily(familyId);

  if (children.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <ParentTopBar parentName={parentName} />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-[#5c655f] max-w-xs">
            В семье пока нет детей. Добавьте профиль ребёнка, чтобы начать ежедневный чек-ин.
          </p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const selectedChild = children.find((c) => c.id === params.child) ?? children[0];

  const checkins = await getRecentCheckins(selectedChild.id, 14);
  const alerts = await getOpenAlertsForChild(selectedChild.id);
  const dominantDomain = await getDominantDomain(selectedChild);
  const recommendations = getRecommendations(dominantDomain, selectedChild.age_group, 3);
  const weekStart = getCurrentWeekStart();
  const weeklyObservationDone = !!(await getWeeklyObservationForWeek(selectedChild.id, weekStart));

  const moodPoints = [...checkins]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({ date: c.date, value: c.mood_value }));

  const data: ParentDashboardData = {
    children: children.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      age_group: c.age_group,
    })),
    selectedChild: {
      id: selectedChild.id,
      name: selectedChild.name,
      avatar: selectedChild.avatar,
      age_group: selectedChild.age_group,
    },
    familyCode: family!.code,
    familyName: family!.name,
    moodPoints,
    checkinRate: getCheckinRate(checkins, 7),
    trend: getTrendDirection(checkins),
    alerts,
    recommendations,
    dominantDomain,
    weekStart,
    weeklyObservationDone,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ParentTopBar parentName={parentName} />
      <ParentDashboard data={data} />
    </div>
  );
}
