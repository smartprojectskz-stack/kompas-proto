import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listFamilies, listChildrenWithFamily } from "@/lib/queries";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import { calcAge } from "@/lib/ageGroup";
import AdminTopBar from "../_components/AdminTopBar";

export default async function AdminFamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { q } = await searchParams;
  const families = await listFamilies(q);
  const allChildren = await listChildrenWithFamily();
  const children = allChildren.filter(
    (c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.family_name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg)]">
      <AdminTopBar active="families" />
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <form method="get" className="mb-4">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Поиск по семье или ребёнку"
            className="w-full py-3 px-4 rounded-xl border border-[var(--line)] text-sm"
          />
        </form>

        <div className="card-duo p-4 mb-4">
          <h3 className="text-sm font-medium mb-3">Семьи ({families.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-[#8C8577]">
                  <th className="py-2 pr-2">Код</th>
                  <th className="py-2 pr-2">Название</th>
                  <th className="py-2 pr-2">Детей</th>
                  <th className="py-2 pr-2">Сигналы</th>
                </tr>
              </thead>
              <tbody>
                {families.map((f) => (
                  <tr key={f.id} className="border-t border-[var(--line)]">
                    <td className="py-2 pr-2 font-mono">{f.code}</td>
                    <td className="py-2 pr-2">{f.name}</td>
                    <td className="py-2 pr-2">{f.childCount}</td>
                    <td className="py-2 pr-2">
                      {f.openAlerts > 0 ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FBEAE0] text-[#8A4A2A]">
                          {f.openAlerts}
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8F0E1] text-[#4C7A46]">
                          0
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-duo p-4">
          <h3 className="text-sm font-medium mb-3">Дети ({children.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-[#8C8577]">
                  <th className="py-2 pr-2">Семья</th>
                  <th className="py-2 pr-2">Ребёнок</th>
                  <th className="py-2 pr-2">Возраст</th>
                  <th className="py-2 pr-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--line)]">
                    <td className="py-2 pr-2">{c.family_name}</td>
                    <td className="py-2 pr-2">
                      {c.avatar} {c.name}
                    </td>
                    <td className="py-2 pr-2">
                      {calcAge(c.birth_date)} ({AGE_GROUP_LABEL[c.age_group]})
                    </td>
                    <td className="py-2 pr-2">
                      {c.openAlerts > 0 ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FBEAE0] text-[#8A4A2A]">
                          Внимание
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8F0E1] text-[#4C7A46]">
                          Норма
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
