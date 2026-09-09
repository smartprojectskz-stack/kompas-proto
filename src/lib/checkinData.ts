// Static configuration for age-specific check-in content.

export interface WeatherOption {
  key: string;
  emoji: string;
  label: string;
  response: string;
  moodValue: number; // 1-5, 5 = hardest
  bg: string;
}

export const WEATHER_OPTIONS: WeatherOption[] = [
  { key: "sun", emoji: "☀️", label: "Солнце", response: "Солнечный денёк!", moodValue: 1, bg: "#FFF6E4" },
  { key: "cloud", emoji: "⛅", label: "Облачно", response: "Немного облачно — и это нормально.", moodValue: 2, bg: "#EEF2FA" },
  { key: "rainbow", emoji: "🌈", label: "Радуга", response: "Ура, радуга! Что-то хорошее случилось?", moodValue: 2, bg: "#F1F7EC" },
  { key: "storm", emoji: "🌧️", label: "Гроза", response: "Ого, буря внутри. Мы рядом.", moodValue: 5, bg: "#EDEBF5" },
];

export interface MoodOption {
  key: string;
  emoji: string;
  label: string;
  response: string;
  moodValue: number; // 1-5, 5 = hardest
}

export const MOOD_OPTIONS_7_11: MoodOption[] = [
  { key: "great", emoji: "😄", label: "Супер", response: "Здорово! Что сегодня было самым классным?", moodValue: 1 },
  { key: "good", emoji: "🙂", label: "Хорошо", response: "Хорошо, что день был неплохим. Спасибо, что рассказал(а)!", moodValue: 2 },
  { key: "meh", emoji: "😐", label: "Так себе", response: "Бывает. Хочешь подышать вместе минутку?", moodValue: 3 },
  { key: "sad", emoji: "😔", label: "Грустно", response: "Жаль, что так. Хочешь назвать, что случилось — или просто побыть с этим?", moodValue: 4 },
  { key: "mad", emoji: "😣", label: "Тяжело", response: "Похоже, было тяжело. Дыхание может немного помочь прямо сейчас.", moodValue: 5 },
];

export const ROTATING_PROMPTS_7_11: string[] = [
  "Что было сегодня самым сложным?",
  "Кого сегодня не хватало рядом?",
  "Что тебя сегодня рассмешило?",
  "Было ли сегодня что-то, чего ты боялся(ась)?",
  "Кому ты сегодня помог(ла) или кто помог тебе?",
];

export interface Dilemma {
  key: string;
  story: string;
  options: { text: string; sub: string; pattern: "avoidance" | "aggression" | "assertive" | "self_blame" }[];
}

export const DILEMMAS_7_11: Dilemma[] = [
  {
    key: "broken_toy",
    story: "Друг взял твою вещь без спроса и сломал. Что тебе ближе всего?",
    options: [
      { text: "Сказать сразу", sub: "«Мне неприятно, что так вышло»", pattern: "assertive" },
      { text: "Промолчать", sub: "и просто отойти в сторону", pattern: "avoidance" },
      { text: "Разозлиться", sub: "и накричать", pattern: "aggression" },
    ],
  },
  {
    key: "not_invited",
    story: "Одноклассники играли на перемене и не позвали тебя. Что ты сделаешь?",
    options: [
      { text: "Подойти и спросить", sub: "можно ли присоединиться", pattern: "assertive" },
      { text: "Решить, что дело во мне", sub: "и весь день грустить об этом", pattern: "self_blame" },
      { text: "Уйти в сторону", sub: "и заняться чем-то одному/одной", pattern: "avoidance" },
    ],
  },
  {
    key: "bad_grade",
    story: "Ты получил(а) плохую оценку за контрольную. Первая мысль?",
    options: [
      { text: "Разобрать ошибки", sub: "и понять, что подтянуть", pattern: "assertive" },
      { text: "Я просто глупый/глупая", sub: "и ничего не получится", pattern: "self_blame" },
      { text: "Спрятать дневник", sub: "и никому не говорить", pattern: "avoidance" },
    ],
  },
  {
    key: "teasing",
    story: "Кто-то в классе подшучивает над тобой не очень по-доброму. Что ближе?",
    options: [
      { text: "Сказать: «Мне это не нравится»", sub: "прямо в моменте", pattern: "assertive" },
      { text: "Отшутиться в ответ зло", sub: "чтобы задело в ответ", pattern: "aggression" },
      { text: "Делать вид, что не слышишь", sub: "и терпеть", pattern: "avoidance" },
    ],
  },
  {
    key: "sibling_fight",
    story: "Ты поссорился(ась) с братом/сестрой из-за игрушки. Что дальше?",
    options: [
      { text: "Предложить договориться", sub: "по очереди или обменяться", pattern: "assertive" },
      { text: "Настоять на своём криком", sub: "пока не отдаст", pattern: "aggression" },
      { text: "Уступить и промолчать", sub: "даже если обидно", pattern: "avoidance" },
    ],
  },
  {
    key: "new_kid",
    story: "В классе появился новый ученик, и ему явно неловко один на перемене. Что сделаешь?",
    options: [
      { text: "Подойти и заговорить", sub: "первым/первой", pattern: "assertive" },
      { text: "Понаблюдать издалека", sub: "но не подходить", pattern: "avoidance" },
      { text: "Ничего, это не моё дело", sub: "и заняться своим", pattern: "avoidance" },
    ],
  },
];

// 12-17
export const MOOD_SCALE_12_17_LABELS = [
  "Очень тяжело",
  "Тяжело",
  "Скорее тяжело",
  "Нейтрально",
  "Скорее хорошо",
  "Хорошо",
  "Отлично",
];

export function moodValue7to5(scaleValue1to7: number): number {
  // map 1..7 (1=hardest,7=best) to 1..5 severity (5=hardest)
  const mapped = Math.round(((8 - scaleValue1to7) / 7) * 4) + 1;
  return Math.min(5, Math.max(1, mapped));
}

export const GATEKEEPER_QUESTION =
  "Бывали ли за последние две недели мысли о том, что не хочется жить?";

export interface BiweeklyDomainItem {
  key: string;
  label: string;
  question: string;
}

export const BIWEEKLY_DOMAINS_12_17: BiweeklyDomainItem[] = [
  { key: "stress", label: "Стресс", question: "Насколько сильным был стресс за последние две недели?" },
  { key: "anxiety", label: "Тревога", question: "Как часто ты чувствовал(а) тревогу без явной причины?" },
  { key: "sleep", label: "Сон и энергия", question: "Насколько хорошо ты высыпаешься и чувствуешь энергию?" },
  { key: "control", label: "Ощущение контроля", question: "Насколько ты чувствуешь контроль над своей жизнью?" },
  { key: "social", label: "Отношения со сверстниками", question: "Насколько ты доволен(льна) отношениями с друзьями?" },
];

// 3-6 weekly parent observation checklist
export interface WeeklyObservationItem {
  key: string;
  label: string;
}

export const WEEKLY_OBSERVATION_ITEMS_3_6: WeeklyObservationItem[] = [
  { key: "sleep", label: "Засыпал(а) с трудом / просыпался(ась) ночью" },
  { key: "outbursts", label: "Были вспышки плача или злости без явной причины" },
  { key: "social", label: "Избегал(а) игр один(одна) и с другими детьми (низкий интерес к игре)" },
  { key: "adaptability", label: "С трудом переключался(ась) между занятиями" },
  { key: "sharing", label: "Не делился(ась) впечатлениями о дне, был(а) замкнут(а)" },
];

export const WEEKLY_OBSERVATION_SCALE = [
  { value: 1, label: "Не было" },
  { value: 2, label: "Редко" },
  { value: 3, label: "Иногда" },
  { value: 4, label: "Часто" },
  { value: 5, label: "Почти каждый день" },
];
