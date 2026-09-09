import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="text-3xl font-semibold text-[var(--teal-dark)] mb-3">Компас</h1>
        <p className="text-[15px] leading-relaxed text-[#5c655f] mb-10">
          Приложение помогает почувствовать эмоциональное состояние ребёнка день за днём —
          без диагнозов и оценок, с понятными подсказками для родителя.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding"
            className="w-full py-4 rounded-2xl bg-[var(--teal)] text-white font-medium hover:bg-[var(--teal-dark)] transition-colors"
          >
            Создать семью
          </Link>
          <Link
            href="/login"
            className="w-full py-4 rounded-2xl bg-white border border-[var(--line)] text-[var(--ink)] font-medium hover:bg-[#faf7f0] transition-colors"
          >
            У меня уже есть код семьи
          </Link>
        </div>

        <Link
          href="/admin/login"
          className="inline-block mt-10 text-xs text-[#9a9384] underline"
        >
          Вход для администратора
        </Link>

        <p className="mt-12 text-xs text-[#9a9384] leading-relaxed">
          Компас не ставит диагнозы и не заменяет консультацию психолога или психиатра.
          Это инструмент наблюдения за эмоциональной динамикой ребёнка.
        </p>
      </div>
    </main>
  );
}
