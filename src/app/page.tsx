import Link from "next/link";
import FireflyMascot from "@/components/FireflyMascot";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-2">
          <FireflyMascot size={168} />
        </div>
        <h1 className="text-4xl font-display font-semibold text-[var(--brand-dark)] mb-3">
          Светлячок
        </h1>
        <p className="text-[15px] leading-relaxed text-[#6E6659] mb-8 max-w-[34ch] mx-auto">
          Приложение помогает почувствовать эмоциональное состояние ребёнка день за днём —
          без диагнозов и оценок, с понятными подсказками для родителя.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/onboarding" className="btn-duo btn-duo-primary w-full py-4">
            Создать семью
          </Link>
          <Link href="/login" className="btn-duo btn-duo-outline w-full py-4">
            У меня уже есть код семьи
          </Link>
        </div>

        <Link
          href="/admin/login"
          className="inline-block mt-8 text-xs text-[#8C8577] underline"
        >
          Вход для администратора
        </Link>

        <p className="mt-10 text-xs text-[#8C8577] leading-relaxed">
          Светлячок не ставит диагнозы и не заменяет консультацию психолога или психиатра.
          Это инструмент наблюдения за эмоциональной динамикой ребёнка.
        </p>
      </div>
    </main>
  );
}
