import type { AgeGroup } from "./types";

export function calcAgeGroup(birthDateISO: string, today: Date = new Date()): AgeGroup {
  const birth = new Date(birthDateISO);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age <= 6) return "3-6";
  if (age <= 11) return "7-11";
  return "12-17";
}

export function calcAge(birthDateISO: string, today: Date = new Date()): number {
  const birth = new Date(birthDateISO);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  "3-6": "3–6 лет",
  "7-11": "7–11 лет",
  "12-17": "12–17 лет",
};
