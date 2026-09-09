"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "@/lib/actions/login";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const res = await adminLoginAction(login, pin);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось войти");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-semibold text-[var(--teal-dark)] mb-6 text-center">
          Вход администратора
        </h1>
        {error && (
          <div className="mb-4 text-sm text-[#8A4A2A] bg-[#FCEFE9] border border-[#EFC5AE] rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="block text-xs text-[#5c655f] mb-1">Логин</span>
            <input
              className="w-full py-3 px-4 rounded-2xl border border-[var(--line)]"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-[#5c655f] mb-1">PIN</span>
            <input
              className="w-full py-3 px-4 rounded-2xl border border-[var(--line)]"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[var(--teal-dark)] text-white font-medium disabled:opacity-60"
          >
            {loading ? "Входим…" : "Войти"}
          </button>
        </div>
        <p className="mt-6 text-xs text-[#9a9384] text-center">
          Учётные данные администратора по умолчанию создаются автоматически при первом запуске
          и сохраняются в data/admin-credentials.txt на сервере.
        </p>
      </div>
    </main>
  );
}
