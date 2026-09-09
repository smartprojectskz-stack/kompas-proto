"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export interface MoodPoint {
  date: string;
  value: number; // 1 (best) .. 5 (hardest) — inverted for display so higher = better
}

export default function MoodChart({ points }: { points: MoodPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-[#9a9384]">
        Пока нет данных за этот период
      </div>
    );
  }
  const data = points.map((p) => ({ date: p.date, wellbeing: 6 - p.value }));
  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <YAxis domain={[1, 5]} hide />
          <Line
            type="monotone"
            dataKey="wellbeing"
            stroke="#8CA88A"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#2F5D5A" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
