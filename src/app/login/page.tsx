"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  lookupFamilyAction,
  parentLoginAction,
  childLoginAction,
  type FamilyMembers,
} from "@/lib/actions/login";
import { AGE_GROUP_LABEL } from "@/lib/ageGroup";
import type { AgeGroup } from "@/lib/types";

type Selected =
  | { kind: "parent"; id: string; name: string }
  | { kind: "child"; id: string; name: string; needsPin: boolean };

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [members, setMembers] = useState<FamilyMembers | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitCode() {
    setError(null);
    if (!code.trim()) return;
    setLoading(true);
    const result = await lookupFamilyAction(code);
    setLoading(false);
    if (!result) {
      setError("Семья с таким кодом не найдена");
      return;
    }
    setMembers(result);
  }

  function selectParent(p: { id: string; name: string }) {
    setSelected({ kind: "parent", id: p.id, name: p.name });
    setPin("");
    setError(null);
  }

  async function selectChild(c: { id: string; name: string; needsPin: boolean }) {
    setError(null);
    if (!c.needsPin) {
      setLoading(true);
      const res = await childLoginAction(c.id);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Не удалось войти");
        return;
      }
      router.push("/child");
      return;
    }
    setSelected({ kind: "child", id: c.id, name: c.name, needsPin: true });
    setPin("");
  }

  async function submitPin() {
    if (!selected) return;
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError("Введите 4-значный PIN");
      return;
    }
    setLoading(true);
    if (selected.kind === "parent") {
      const res = await parentLoginAction(selected.id, pin);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Неверный PIN");
        return;
      }
      router.push("/parent");
    } else {
      const res = await childLoginAction(selected.id, pin);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Неверный PIN");
        return;
      }
      router.push("/child");
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-semibold text-[var(--brand-dark)] mb-6 text-center">Вход</h1>

        {error && (
          <div className="mb-4 text-sm text-[#8A4A2A] bg-[#FBEAE0] border border-[#E8C3A6] rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!members && (
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="block text-xs text-[#6E6659] mb-1">Код семьи</span>
              <input
                className="w-full py-4 px-4 rounded-2xl border border-[var(--line)] text-center text-2xl tracking-[0.3em] uppercase"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
              />
            </label>
            <button
              onClick={submitCode}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-dark)] disabled:opacity-60"
            >
              {loading ? "Ищем…" : "Продолжить"}
            </button>
          </div>
        )}

        {members && !selected && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#6E6659] mb-1">{members.family.name} — выберите профиль</p>
            {members.parents.map((p) => (
              <button
                key={p.id}
                onClick={() => selectParent(p)}
                className="flex items-center gap-3 bg-white border border-[var(--line)] rounded-2xl px-4 py-3 text-left hover:border-[var(--brand)]"
              >
                <span className="text-2xl">👤</span>
                <span>
                  <span className="block font-medium">{p.name}</span>
                  <span className="block text-xs text-[#8C8577]">Родитель</span>
                </span>
              </button>
            ))}
            {members.children.map((c) => (
              <button
                key={c.id}
                onClick={() => selectChild(c)}
                className="flex items-center gap-3 bg-white border border-[var(--line)] rounded-2xl px-4 py-3 text-left hover:border-[var(--brand)]"
              >
                <span className="text-2xl">{c.avatar}</span>
                <span>
                  <span className="block font-medium">{c.name}</span>
                  <span className="block text-xs text-[#8C8577]">
                    {AGE_GROUP_LABEL[c.age_group as AgeGroup]}
                    {c.needsPin ? " · нужен PIN" : ""}
                  </span>
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                setMembers(null);
                setCode("");
              }}
              className="text-xs text-[#8C8577] underline mt-2"
            >
              Ввести другой код
            </button>
          </div>
        )}

        {selected && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#6E6659]">PIN для {selected.name}</p>
            <input
              className="w-full py-4 px-4 rounded-2xl border border-[var(--line)] text-center text-2xl tracking-[0.3em]"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
            />
            <button
              onClick={submitPin}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-dark)] disabled:opacity-60"
            >
              {loading ? "Входим…" : "Войти"}
            </button>
            <button onClick={() => setSelected(null)} className="text-xs text-[#8C8577] underline">
              Назад к выбору профиля
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
