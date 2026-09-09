import { CRISIS_CONTACTS } from "@/lib/content";

export default function CrisisScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="text-5xl mb-4">💙</div>
      <h2 className="text-xl font-display font-semibold text-[var(--brand-dark)] mb-3">
        Спасибо, что сказал(а) честно
      </h2>
      <p className="text-sm text-[#6E6659] max-w-sm mb-6 leading-relaxed">
        То, что ты чувствуешь — важно, и с этим не нужно оставаться одному/одной. Пожалуйста,
        поговори прямо сейчас со взрослым, которому доверяешь, или свяжись с одной из линий
        поддержки ниже. Они работают бесплатно и круглосуточно.
      </p>
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {CRISIS_CONTACTS.map((c) => (
          <div key={c.name} className="bg-white border border-[var(--line)] rounded-2xl p-4 text-left">
            <div className="text-lg font-semibold text-[var(--brand-dark)]">{c.phone}</div>
            <div className="text-sm font-medium">{c.name}</div>
            <div className="text-xs text-[#8C8577] mt-1">{c.note}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#8C8577] max-w-sm">
        Мы также сообщим об этом взрослому в вашей семье как сигнал, что нужна поддержка —
        без подробностей дневника.
      </p>
    </div>
  );
}
