import { logoutAction } from "@/lib/actions/logout";

export default function ParentTopBar({ parentName }: { parentName: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-white">
      <span className="text-sm font-medium text-[var(--teal-dark)]">🧭 Компас · {parentName}</span>
      <form action={logoutAction}>
        <button type="submit" className="text-xs text-[#9a9384] underline">
          Выйти
        </button>
      </form>
    </div>
  );
}
