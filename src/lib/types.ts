export type AgeGroup = "3-6" | "7-11" | "12-17";

export type Role = "parent" | "child" | "admin";

export interface Family {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Parent {
  id: string;
  family_id: string;
  name: string;
  pin_hash: string;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  birth_date: string;
  age_group: AgeGroup;
  avatar: string;
  pin_hash: string | null;
  created_at: string;
}

export interface Checkin {
  id: string;
  child_id: string;
  date: string;
  mood_key: string;
  mood_value: number;
  note: string | null;
  prompt_answer: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  family_id: string;
  child_id: string;
  type: "gatekeeper" | "trend" | "pattern";
  severity: "critical" | "warn";
  message: string;
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface ParentCheckin {
  id: string;
  parent_id: string;
  family_id: string;
  date: string;
  mood_value: number;
  created_at: string;
}

export interface SessionRecord {
  id: string;
  role: Role;
  family_id: string | null;
  parent_id: string | null;
  child_id: string | null;
  admin_id: string | null;
  expires_at: string;
  created_at: string;
}
