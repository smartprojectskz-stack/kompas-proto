import { logoutAction } from "@/lib/actions/logout";
import FireflyMark from "@/components/FireflyMark";

export default function ParentTopBar({ parentName }: { parentName: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-white">
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--brand-dark)]">
        <FireflyMark size={20} />
        Светлячок · {parentName}
      </span>
      <form action={logoutAction}>
        <button type="submit" className="text-xs text-[#8C8577] underline">
          Выйти
        </button>
      </form>
    </div>
  );
}
