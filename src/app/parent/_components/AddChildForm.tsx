"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addChildAction } from "@/lib/actions/parent";
import { calcAgeGroup, AGE_GROUP_LABEL } from "@/lib/ageGroup";

const AVATARS = ["🙂", "🦊", "🐼", "🐸", "🦄", "🐨", "🐯", "🐰"];

export default function AddChildForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const group = birthDate ? calcAgeGroup(birthDate) : null;

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await addChildAction(name, birthDate, avatar, pin || undefined);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось добавить ребёнка");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-30 px-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6">
        <h3 className="text-lg font-display font-semibold text-[var(--brand-dark)] mb-4">Добавить ребёнка</h3>
        {error && (
          <div className="mb-3 text-sm text-[#8A4A2A] bg-[#FBEAE0] border border-[#E8C3A6] rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center border-2 ${
                avatar === a ? "border-[var(--glow)] bg-[#FDECC7]" : "border-[var(--line)] bg-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <label className="block mb-3">
          <span className="block text-xs text-[#6E6659] mb-1">Имя</span>
          <input
            className="w-full py-3 px-4 rounded-xl border border-[var(--line)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block mb-2">
          <span className="block text-xs text-[#6E6659] mb-1">Дата рождения</span>
          <input
            type="date"
            className="w-full py-3 px-4 rounded-xl border border-[var(--line)]"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>
        {group && (
          <p className="text-xs text-[#8C8577] mb-3">Возрастной сценарий: {AGE_GROUP_LABEL[group]}</p>
        )}
        {group === "12-17" && (
          <label className="block mb-3">
            <span className="block text-xs text-[#6E6659] mb-1">PIN ребёнка (4 цифры)</span>
            <input
              className="w-full py-3 px-4 rounded-xl border border-[var(--line)]"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-duo btn-duo-outline flex-1 py-3 text-sm">
            Отмена
          </button>
          <button onClick={submit} disabled={submitting} className="btn-duo btn-duo-primary flex-1 py-3 text-sm">
            {submitting ? "Добавляем…" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
