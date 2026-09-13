import { redirect } from "next/navigation";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getChildrenForFamily, getAllAlertsForChild } from "@/lib/queries";
import { CRISIS_CONTACTS, ALERT_TYPE_LABEL, PRIVACY_INTRO, PRIVACY_TABLE } from "@/lib/content";
import ParentTopBar from "../_components/ParentTopBar";

export default async function SafetyCenterPage({
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
  const alerts = await getAllAlertsForChild(selectedChild.id);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ParentTopBar parentName={parentName} />
      <div className="max-w-lg mx-auto w-full px-4 py-6">
        <Link href="/parent" className="text-xs text-[var(--brand)] underline mb-4 inline-block">
          ← Назад в дашборд
        </Link>
        <h1 className="text-xl font-display font-semibold text-[var(--brand-dark)] mb-4">
          🛟 Центр безопасности
        </h1>

        {children.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {children.map((c) => {
              const isSelected = c.id === selectedChild.id;
              return (
                <Link
                  key={c.id}
                  href={`/parent/safety?child=${c.id}`}
                  className="px-3 py-2 rounded-full text-sm font-medium border-2"
                  style={
                    isSelected
                      ? { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }
                      : { background: "#fff", color: "var(--ink)", borderColor: "var(--line)" }
                  }
                >
                  {c.avatar} {c.name}
                </Link>
              );
            })}
          </div>
        )}

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-3">Кризисные контакты</h3>
          <div className="flex flex-col gap-2">
            {CRISIS_CONTACTS.map((c) => (
              <div key={c.name} className="text-sm">
                <b className="text-[var(--brand-dark)]">{c.phone}</b>{" "}
                <span className="text-[#6E6659]">— {c.name}</span>
                <div className="text-xs text-[#8C8577]">{c.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-3">
            История сигналов — {selectedChild.name}
          </h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-[#6E6659]">Сигналов пока не было.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="border-l-4 pl-3"
                  style={{ borderColor: a.severity === "critical" ? "#E9A387" : "var(--line)" }}
                >
                  <div className="flex items-center gap-2 text-xs text-[#8C8577] mb-1">
                    <span>{ALERT_TYPE_LABEL[a.type] ?? a.type}</span>
                    <span>·</span>
                    <span>{a.status === "open" ? "открыт" : "решён"}</span>
                    <span>·</span>
                    <span>{a.created_at.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-[#2E3550]">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-display font-medium mb-2">🔒 Приватность</h3>
          <p className="text-sm text-[#6E6659] mb-3">{PRIVACY_INTRO}</p>
          <div className="flex flex-col gap-1">
            {PRIVACY_TABLE.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-[#6E6659]">{row.label}</span>
                <span>{row.parentSees === "yes" ? "✅" : row.parentSees === "no" ? "❌" : "🚨"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
