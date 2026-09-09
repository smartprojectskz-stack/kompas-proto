import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ADVICE_LIBRARY, DOMAIN_LABEL } from "@/lib/content";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import AdminTopBar from "../_components/AdminTopBar";

export default async function AdminContentPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg)]">
      <AdminTopBar active="content" />
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="bg-white border border-[var(--line)] rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-medium mb-1">Библиотека рекомендаций</h3>
          <p className="text-xs text-[#9a9384]">
            3 возрастные шкалы · {ADVICE_LIBRARY.length} рекомендаций · версия MVP
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {ADVICE_LIBRARY.map((item) => (
            <div key={item.title} className="bg-white border border-[var(--line)] rounded-2xl p-4">
              <div className="flex justify-between items-start gap-2 mb-1">
                <b className="text-sm">{item.title}</b>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F6F2E9] text-[#6b6455] whitespace-nowrap">
                  {DOMAIN_LABEL[item.domain]}
                </span>
              </div>
              <p className="text-xs text-[#5c655f] mb-2">{item.text}</p>
              <div className="flex gap-1">
                {item.ageGroups.map((g) => (
                  <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF6FB] text-[#2F5D5A]">
                    {AGE_GROUP_LABEL[g]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
