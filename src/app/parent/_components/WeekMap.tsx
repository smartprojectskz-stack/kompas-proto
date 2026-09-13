import { moodValueEmoji } from "@/lib/content";
import type { WeekMapDay } from "@/lib/insights";

export default function WeekMap({ days }: { days: WeekMapDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#8C8577]">{d.weekday}</span>
          <div
            className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg ${
              d.isToday ? "border-2 border-[var(--glow)]" : "border border-[var(--line)]"
            }`}
            style={{ background: d.value === null ? "#F7EEDD" : "#fff" }}
          >
            {d.value === null ? (
              <span className="text-[#C9BFA6] text-sm">·</span>
            ) : (
              moodValueEmoji(d.value)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
