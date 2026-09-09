"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFamilyAction, type OnboardingChildInput } from "@/lib/actions/onboarding";
import { calcAgeGroup, AGE_GROUP_LABEL } from "@/lib/ageGroup";
import FireflyMascot from "@/components/FireflyMascot";

const AVATARS = ["🙂", "🦊", "🐼", "🐸", "🦄", "🐨", "🐯", "🐰"];

interface DraftChild extends OnboardingChildInput {
  id: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPin, setParentPin] = useState("");
  const [parentPinConfirm, setParentPinConfirm] = useState("");

  const [children, setChildren] = useState<DraftChild[]>([
    { id: crypto.randomUUID(), name: "", birthDate: "", avatar: AVATARS[0] },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(null);

  function updateChild(id: string, patch: Partial<DraftChild>) {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addChild() {
    setChildren((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", birthDate: "", avatar: AVATARS[prev.length % AVATARS.length] },
    ]);
  }

  function removeChild(id: string) {
    setChildren((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));
  }

  function goStep2() {
    setError(null);
    if (!familyName.trim() || !parentName.trim()) {
      setError("Заполните название семьи и имя родителя");
      return;
    }
    if (!/^\d{4}$/.test(parentPin)) {
      setError("PIN должен состоять из 4 цифр");
      return;
    }
    if (parentPin !== parentPinConfirm) {
      setError("PIN не совпадает с подтверждением");
      return;
    }
    setStep(2);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await createFamilyAction(
      familyName,
      parentName,
      parentPin,
      children.map(({ name, birthDate, avatar, pin }) => ({ name, birthDate, avatar, pin }))
    );
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось создать семью");
      return;
    }
    setFamilyCode(res.familyCode ?? null);
    setStep(3);
  }

  if (step === 3 && familyCode) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-2">
            <FireflyMascot size={128} />
          </div>
          <h1 className="text-2xl font-display font-semibold text-[var(--brand-dark)] mb-3">
            Семья создана
          </h1>
          <p className="text-sm text-[#6E6659] mb-6">
            Сохраните код семьи — он понадобится для входа с других устройств и детям.
          </p>
          <div className="text-4xl font-display font-semibold tracking-[0.3em] text-[var(--brand)] card-duo py-6 mb-8">
            {familyCode}
          </div>
          <button
            onClick={() => router.push("/parent")}
            className="btn-duo btn-duo-primary w-full py-4"
          >
            Перейти в дашборд родителя
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-2xl font-display font-semibold text-[var(--brand-dark)] mb-1">Создание семьи</h1>
        <p className="text-sm text-[#8C8577] mb-6">Шаг {step} из 2</p>

        {error && (
          <div className="mb-4 text-sm text-[#8A4A2A] bg-[#FBEAE0] border border-[#E8C3A6] rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Название семьи">
              <input
                className="input"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Например: Ивановы"
              />
            </Field>
            <Field label="Ваше имя (родитель)">
              <input
                className="input"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Имя"
              />
            </Field>
            <Field label="Придумайте PIN из 4 цифр">
              <input
                className="input"
                inputMode="numeric"
                maxLength={4}
                value={parentPin}
                onChange={(e) => setParentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
              />
            </Field>
            <Field label="Повторите PIN">
              <input
                className="input"
                inputMode="numeric"
                maxLength={4}
                value={parentPinConfirm}
                onChange={(e) => setParentPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
              />
            </Field>
            <button onClick={goStep2} className="btn-duo btn-duo-primary mt-2 w-full py-4">
              Далее
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            {children.map((c, idx) => {
              const group = c.birthDate ? calcAgeGroup(c.birthDate) : null;
              return (
                <div key={c.id} className="card-duo p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Ребёнок {idx + 1}</span>
                    {children.length > 1 && (
                      <button
                        onClick={() => removeChild(c.id)}
                        className="text-xs text-[#8C8577] underline"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => updateChild(c.id, { avatar: a })}
                        className={`w-10 h-10 rounded-full text-lg flex items-center justify-center border-2 ${
                          c.avatar === a ? "border-[var(--glow)] bg-[#FDECC7]" : "border-[var(--line)] bg-white"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <Field label="Имя">
                    <input
                      className="input"
                      value={c.name}
                      onChange={(e) => updateChild(c.id, { name: e.target.value })}
                      placeholder="Имя ребёнка"
                    />
                  </Field>
                  <div className="mt-3">
                    <Field label="Дата рождения">
                      <input
                        className="input"
                        type="date"
                        value={c.birthDate}
                        onChange={(e) => updateChild(c.id, { birthDate: e.target.value })}
                      />
                    </Field>
                  </div>
                  {group && (
                    <p className="mt-2 text-xs text-[#8C8577]">
                      Возрастной сценарий: {AGE_GROUP_LABEL[group]}
                    </p>
                  )}
                  {group === "12-17" && (
                    <div className="mt-3">
                      <Field label="PIN ребёнка (4 цифры, для приватности дневника)">
                        <input
                          className="input"
                          inputMode="numeric"
                          maxLength={4}
                          value={c.pin ?? ""}
                          onChange={(e) =>
                            updateChild(c.id, { pin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                          }
                          placeholder="••••"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={addChild}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--line)] text-sm font-medium text-[var(--brand)]"
            >
              + Добавить ещё ребёнка
            </button>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="btn-duo btn-duo-outline flex-1 py-4">
                Назад
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-duo btn-duo-primary flex-1 py-4"
              >
                {submitting ? "Создаём…" : "Создать семью"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-size: 14px;
          background: white;
        }
        .input:focus {
          outline: 2px solid var(--brand);
          outline-offset: -1px;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[#6E6659] mb-1">{label}</span>
      {children}
    </label>
  );
}
