import Link from "next/link";
import FireflyMark from "@/components/FireflyMark";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <FireflyMark size={56} />
        </div>
        <h1 className="text-3xl font-display font-semibold text-[var(--brand-dark)] mb-3">
          Светлячок
        </h1>
        <p className="text-[15px] leading-relaxed text-[#6E6659] mb-10">
          Приложение помогает почувствовать эмоциональное состояние ребёнка день за днём —
          без диагнозов и оценок, с понятными подсказками для родителя.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding"
            className="w-full py-4 rounded-2xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-dark)] transition-colors"
          >
            Создать семью
          </Link>
          <Link
            href="/login"
            className="w-full py-4 rounded-2xl bg-white border border-[var(--line)] text-[var(--ink)] font-medium hover:bg-[#F7EEDD] transition-colors"
          >
            У меня уже есть код семьи
          </Link>
        </div>

        <Link
          href="/admin/login"
          className="inline-block mt-10 text-xs text-[#8C8577] underline"
        >
          Вход для администратора
        </Link>

        <p className="mt-12 text-xs text-[#8C8577] leading-relaxed">
          Светлячок не ставит диагнозы и не заменяет консультацию психолога или психиатра.
          Это инструмент наблюдения за эмоциональной динамикой ребёнка.
        </p>
      </div>
    </main>
  );
}
