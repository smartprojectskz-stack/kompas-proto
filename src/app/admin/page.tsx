import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, getAllOpenAlerts } from "@/lib/queries";
import AdminTopBar from "./_components/AdminTopBar";
import RiskQueue from "./_components/RiskQueue";

export default async function AdminOverviewPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const stats = await getAdminStats();
  const alerts = await getAllOpenAlerts();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg)]">
      <AdminTopBar active="overview" />
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatBox num={String(stats.familiesCount)} label="семей" />
          <StatBox num={`${Math.round(stats.checkinRateThisWeek * 100)}%`} label="чек-ин / неделя" />
          <StatBox num={String(stats.openAlertsCount)} label="сигнала риска" />
        </div>

        <div className="card-duo p-4">
          <h3 className="text-sm font-display font-medium mb-3">Очередь сигналов риска</h3>
          <RiskQueue alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ num, label }: { num: string; label: string }) {
  return (
    <div className="bg-white border-2 border-[var(--line)] rounded-xl p-3 text-center">
      <div className="font-display text-xl text-[var(--brand-dark)] leading-tight">{num}</div>
      <div className="text-[11px] text-[#8C8577] mt-1">{label}</div>
    </div>
  );
}
