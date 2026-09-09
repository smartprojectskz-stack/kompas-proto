import Link from "next/link";
import { logoutAction } from "@/lib/actions/logout";

export default function AdminTopBar({ active }: { active: "overview" | "families" | "content" }) {
  const tabs = [
    { key: "overview", label: "Обзор", href: "/admin" },
    { key: "families", label: "Семьи", href: "/admin/families" },
    { key: "content", label: "Контент", href: "/admin/content" },
  ] as const;

  return (
    <div className="bg-[var(--teal-dark)] px-3 py-3 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                active === t.key ? "bg-[var(--teal)] text-white" : "text-[#CFE0DC]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-[#CFE0DC] underline">
            Выйти
          </button>
        </form>
      </div>
    </div>
  );
}
