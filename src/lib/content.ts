import type { AgeGroup } from "./types";

export type Domain =
  | "anxiety"
  | "mood"
  | "sleep_regulation"
  | "social"
  | "self_esteem"
  | "school"
  | "stress"
  | "autonomy";

export const DOMAIN_LABEL: Record<Domain, string> = {
  anxiety: "Тревога",
  mood: "Настроение",
  sleep_regulation: "Сон и саморегуляция",
  social: "Отношения со сверстниками",
  self_esteem: "Самооценка",
  school: "Отношение к школе",
  stress: "Стресс",
  autonomy: "Автономия и границы",
};

export interface AdviceItem {
  title: string;
  text: string;
  domain: Domain;
  ageGroups: AgeGroup[];
}

export const ADVICE_LIBRARY: AdviceItem[] = [
  {
    title: "5 минут вопросов без оценки",
    text: "Спросите «что было сегодня самым сложным», не предлагая сразу решение и не оценивая ответ.",
    domain: "anxiety",
    ageGroups: ["7-11", "12-17"],
  },
  {
    title: "Назвать чувство вслух",
    text: "«Похоже, тебе было тревожно перед контрольной» — проговаривание чувства взрослым снижает накал само по себе.",
    domain: "anxiety",
    ageGroups: ["3-6", "7-11", "12-17"],
  },
  {
    title: "Материал: тревога у младших школьников",
    text: "Короткое чтение без терминов о том, как проявляется тревога в 7–11 лет и что помогает.",
    domain: "anxiety",
    ageGroups: ["7-11"],
  },
  {
    title: "Ритуал перед сном",
    text: "Стабильный короткий ритуал (сказка, приглушённый свет, одно и то же время) снижает ночные пробуждения у малышей.",
    domain: "sleep_regulation",
    ageGroups: ["3-6"],
  },
  {
    title: "Побудьте рядом молча",
    text: "При вспышке злости или слёз без явной причины — не выяснять причину сразу, а физически побыть рядом, пока буря не утихнет.",
    domain: "sleep_regulation",
    ageGroups: ["3-6"],
  },
  {
    title: "Спросите про друзей без допроса",
    text: "«С кем сегодня было веселее всего?» лучше работает, чем «тебя никто не обижал?».",
    domain: "social",
    ageGroups: ["7-11", "12-17"],
  },
  {
    title: "Замечайте усилия, а не только результат",
    text: "«Ты не сдался, хотя было сложно» укрепляет самооценку сильнее, чем похвала за оценку.",
    domain: "self_esteem",
    ageGroups: ["7-11", "12-17"],
  },
  {
    title: "Не обесценивайте школьные трудности",
    text: "Фраза «это всего лишь школа» закрывает разговор. Лучше: «расскажи, что там происходит».",
    domain: "school",
    ageGroups: ["7-11", "12-17"],
  },
  {
    title: "Дайте немного контроля",
    text: "Подростку важно ощущать, что часть решений о его дне принимает он сам — предложите выбор там, где это безопасно.",
    domain: "autonomy",
    ageGroups: ["12-17"],
  },
  {
    title: "Спросите про источник стресса, не про оценку",
    text: "«Что сейчас давит больше всего — учёба, отношения, что-то дома?» открывает разговор лучше, чем «как дела в школе».",
    domain: "stress",
    ageGroups: ["12-17"],
  },
  {
    title: "Практика дыхания вместе",
    text: "1 минута медленного дыхания вдвоём помогает и ребёнку, и взрослому снизить накал в моменте.",
    domain: "mood",
    ageGroups: ["3-6", "7-11", "12-17"],
  },
  {
    title: "Не сравнивайте с собой в его возрасте",
    text: "«В твоём возрасте я справлялся» обесценивает опыт ребёнка. Лучше признать, что ему сейчас трудно.",
    domain: "mood",
    ageGroups: ["7-11", "12-17"],
  },
];

export function getRecommendations(domain: Domain | null, ageGroup: AgeGroup, limit = 3): AdviceItem[] {
  const pool = ADVICE_LIBRARY.filter((a) => a.ageGroups.includes(ageGroup));
  const matched = domain ? pool.filter((a) => a.domain === domain) : [];
  const rest = pool.filter((a) => !matched.includes(a));
  return [...matched, ...rest].slice(0, limit);
}

export interface CrisisContact {
  name: string;
  phone: string;
  note: string;
}

export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    name: "Детский телефон доверия (Казахстан)",
    phone: "150",
    note: "Бесплатно, круглосуточно, анонимно — для детей, подростков и родителей",
  },
  {
    name: "Детский телефон доверия (Россия)",
    phone: "8-800-2000-122",
    note: "Бесплатно, круглосуточно, анонимно",
  },
  {
    name: "Экстренные службы",
    phone: "112",
    note: "Если есть непосредственная угроза жизни — звоните немедленно",
  },
];

export const CONVERSATION_STARTERS: Record<AgeGroup, string[]> = {
  "3-6": [
    "Что было самым весёлым сегодня?",
    "Какого цвета было бы твоё сегодня?",
    "Кого ты сегодня обнимал(а)?",
  ],
  "7-11": [
    "Что сегодня было самым приятным моментом?",
    "Было сегодня что-нибудь, что тебя раздражало?",
    "С кем сегодня было интереснее всего?",
    "Что бы ты хотел(а) переделать, если бы мог(ла)?",
  ],
  "12-17": [
    "Что сегодня забрало у тебя больше всего сил?",
    "Есть что-то, о чём ты думал(а) весь день?",
    "Что бы тебе помогло сейчас — совет, объятия или просто побыть рядом?",
    "Что было бы для тебя хорошим завтра?",
  ],
};

export function getConversationStarter(ageGroup: AgeGroup, seed: number = new Date().getDate()): string {
  const list = CONVERSATION_STARTERS[ageGroup];
  return list[seed % list.length];
}

export interface PrivacyRow {
  label: string;
  parentSees: "yes" | "no" | "alert";
}

export const PRIVACY_TABLE: PrivacyRow[] = [
  { label: "Общий эмоциональный тренд", parentSees: "yes" },
  { label: "Количество чек-инов", parentSees: "yes" },
  { label: "Частые темы (сон, тревога, отношения…)", parentSees: "yes" },
  { label: "Текст личного дневника", parentSees: "no" },
  { label: "Каждый отдельный ответ ребёнка", parentSees: "no" },
  { label: "Сигнал о безопасности", parentSees: "alert" },
];

export const PRIVACY_INTRO =
  "Светлячок не следит за ребёнком. Он помогает замечать изменения — не читать переписку с самим собой.";

export interface ComfortOption {
  key: string;
  emoji: string;
  label: string;
  tip: string;
}

export const COMFORT_OPTIONS: ComfortOption[] = [
  {
    key: "breathe",
    emoji: "🌬",
    label: "Подышать",
    tip: "Открываем дыхательную практику на минуту.",
  },
  {
    key: "listen",
    emoji: "🎵",
    label: "Послушать",
    tip: "Включи свою любимую спокойную песню и просто полежи или посиди с ней 3–5 минут.",
  },
  {
    key: "distract",
    emoji: "🧸",
    label: "Отвлечься",
    tip: "Порисуй, полепи или поиграй 5 минут во что-то, что нравится — не обязательно решать всё прямо сейчас.",
  },
  {
    key: "talk",
    emoji: "💬",
    label: "Поговорить со взрослым",
    tip: "Позови рядом взрослого, которому доверяешь, и просто скажи: «Мне сейчас тяжело».",
  },
];

export function observationStageEmoji(days: number): string {
  if (days >= 30) return "🌟";
  if (days >= 7) return "✨";
  return "🌱";
}

export const SAFETY_DISCLAIMER =
  "Это не диагностика в медицинском смысле, а инструмент наблюдения за динамикой. Приложение не заменяет консультацию психолога или психиатра.";
