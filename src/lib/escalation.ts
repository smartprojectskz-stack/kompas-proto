import { nanoid } from "nanoid";
import { dbGet, dbAll, dbRun } from "./db";
import { sendPushToFamily } from "./push";
import { OBSERVATION_DOMAIN_MAP, REPORT_DOMAIN_MAP } from "./insights";
import { DOMAIN_LABEL } from "./content";
import type { Alert, Checkin } from "./types";

async function createAlert(
  familyId: string,
  childId: string,
  type: Alert["type"],
  severity: Alert["severity"],
  message: string
) {
  // avoid duplicate open alerts of the same type+message for the same child
  const existing = await dbGet(
    `SELECT id FROM alerts WHERE child_id = ? AND type = ? AND status = 'open' AND message = ?`,
    [childId, type, message]
  );
  if (existing) return;
  await dbRun(
    `INSERT INTO alerts (id, family_id, child_id, type, severity, message, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [nanoid(16), familyId, childId, type, severity, message]
  );
  await sendPushToFamily(familyId, {
    title: severity === "critical" ? "🚨 Требуется внимание" : "Светлячок заметил кое-что",
    body: message,
    url: "/parent",
  });
}

/** Called immediately after a gatekeeper safety answer is recorded (12-17). */
export async function evaluateGatekeeper(familyId: string, childId: string, answer: number) {
  if (answer === 1) {
    await createAlert(
      familyId,
      childId,
      "gatekeeper",
      "critical",
      "Ребёнок ответил «да» на вопрос безопасности. Требуется немедленное внимание — обратитесь к специалисту."
    );
  }
}

/** Called after a daily checkin is recorded. Looks at the last 7 days of mood_value (1-5, 5=hardest). */
export async function evaluateMoodTrend(familyId: string, childId: string) {
  const rows = await dbAll<Pick<Checkin, "mood_value">>(
    `SELECT mood_value FROM checkins WHERE child_id = ? ORDER BY date DESC LIMIT 7`,
    [childId]
  );
  if (rows.length < 3) return;
  const hardDays = rows.filter((r) => r.mood_value >= 4).length;
  if (hardDays >= 3) {
    await createAlert(
      familyId,
      childId,
      "trend",
      "warn",
      `За последние ${rows.length} дней тяжёлый эмоциональный фон отмечался ${hardDays} раз(а) — заметно чаще обычного. Это не диагноз — сигнал, что стоит мягко поговорить.`
    );
  }
}

/** 7-11: dilemma response pattern (avoidance / self_blame) over the last 5 responses. */
export async function evaluateDilemmaPattern(familyId: string, childId: string) {
  const rows = await dbAll<{ pattern: string }>(
    `SELECT pattern FROM dilemma_responses WHERE child_id = ? ORDER BY date DESC LIMIT 5`,
    [childId]
  );
  if (rows.length < 5) return;
  const concerning = rows.filter(
    (r) => r.pattern === "avoidance" || r.pattern === "self_blame"
  ).length;
  if (concerning / rows.length >= 0.6) {
    await createAlert(
      familyId,
      childId,
      "pattern",
      "warn",
      `В ${concerning} из последних ${rows.length} историй проявился паттерн избегания или самообвинения. Стоит мягко обсудить, что происходит в общении со сверстниками.`
    );
  }
}

/** 3-6: weekly parent observation — items scored 1-5, higher = more concerning. */
export async function evaluateWeeklyObservation(
  familyId: string,
  childId: string,
  answers: Record<string, number>
) {
  const concerningKeys = Object.entries(answers)
    .filter(([, v]) => v >= 4)
    .map(([k]) => k);
  if (concerningKeys.length >= 3) {
    const labels = [
      ...new Set(concerningKeys.map((k) => DOMAIN_LABEL[OBSERVATION_DOMAIN_MAP[k]] ?? k)),
    ].join(", ");
    await createAlert(
      familyId,
      childId,
      "trend",
      "warn",
      `На этой неделе сразу несколько признаков отмечены как выраженные: ${labels}. Стоит обратить внимание и, при повторении, показать педиатру.`
    );
    return;
  }
  // sustained deviation: same domain >=4 for 3 consecutive weeks
  const recentWeeks = await dbAll<{ answers_json: string }>(
    `SELECT answers_json FROM weekly_observations WHERE child_id = ? ORDER BY week_start DESC LIMIT 3`,
    [childId]
  );
  if (recentWeeks.length < 3) return;
  const parsed = recentWeeks.map((w) => JSON.parse(w.answers_json) as Record<string, number>);
  const keys = Object.keys(answers);
  for (const key of keys) {
    if (parsed.every((w) => (w[key] ?? 0) >= 4)) {
      const label = DOMAIN_LABEL[OBSERVATION_DOMAIN_MAP[key]] ?? key;
      await createAlert(
        familyId,
        childId,
        "trend",
        "warn",
        `Признак «${label}» отмечается три недели подряд. Рекомендуем обсудить это с педиатром или детским психологом.`
      );
      break;
    }
  }
}

/** 12-17: biweekly self-report domains, scored 1-5, higher = more concerning. Sustained over 3 periods. */
export async function evaluateBiweeklyReport(
  familyId: string,
  childId: string,
  scores: Record<string, number>
) {
  const recent = await dbAll<{ domain_scores_json: string }>(
    `SELECT domain_scores_json FROM biweekly_reports WHERE child_id = ? ORDER BY period_start DESC LIMIT 3`,
    [childId]
  );
  if (recent.length < 3) return;
  const parsed = recent.map((r) => JSON.parse(r.domain_scores_json) as Record<string, number>);
  const keys = Object.keys(scores);
  for (const key of keys) {
    if (parsed.every((p) => (p[key] ?? 0) >= 4)) {
      const label = DOMAIN_LABEL[REPORT_DOMAIN_MAP[key]] ?? key;
      await createAlert(
        familyId,
        childId,
        "trend",
        "warn",
        `Показатель «${label}» остаётся повышенным на протяжении нескольких периодов подряд (${parsed.length} отчёта). Стоит предложить поддержку специалиста.`
      );
      break;
    }
  }
}
