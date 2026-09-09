import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { scryptSync, randomBytes } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "kompas.db");

declare global {
  var __kompasDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = global.__kompasDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__kompasDb = db;

db.exec(`
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  age_group TEXT NOT NULL, -- '3-6' | '7-11' | '12-17'
  avatar TEXT NOT NULL DEFAULT '🙂',
  pin_hash TEXT, -- only required for 12-17 (privacy)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Daily checkins, all ages. mood_key is the raw selection (weather/emoji/number).
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  mood_key TEXT NOT NULL,
  mood_value INTEGER NOT NULL, -- normalized 1-5 severity-ascending (5 = hardest)
  note TEXT, -- private note (12-17 journal), never surfaced individually to parent
  prompt_answer TEXT, -- 7-11 rotating question answer
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, date)
);

-- 3-6: weekly parent observation checklist
CREATE TABLE IF NOT EXISTS weekly_observations (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  answers_json TEXT NOT NULL, -- {itemKey: 1-5}
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, week_start)
);

-- 7-11: biweekly dilemma responses
CREATE TABLE IF NOT EXISTS dilemma_responses (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  dilemma_key TEXT NOT NULL,
  pattern TEXT NOT NULL, -- 'avoidance' | 'aggression' | 'assertive' | 'self_blame'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 12-17: biweekly self-report on domains
CREATE TABLE IF NOT EXISTS biweekly_reports (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  domain_scores_json TEXT NOT NULL, -- {domain: 1-5}
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, period_start)
);

-- 12-17: gatekeeper safety question answers
CREATE TABLE IF NOT EXISTS gatekeeper_answers (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  answer INTEGER NOT NULL, -- 0 = no, 1 = yes
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'gatekeeper' | 'trend' | 'pattern'
  severity TEXT NOT NULL, -- 'critical' | 'warn'
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'resolved'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL, -- 'parent' | 'child' | 'admin'
  family_id TEXT,
  parent_id TEXT,
  child_id TEXT,
  admin_id TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Seed a default admin account on first run so /admin/login is reachable out of the box.
// Uses INSERT OR IGNORE + a fixed row id because multiple Next.js build/dev workers can each
// load this module concurrently against the same on-disk database file.
function seedDefaultAdmin() {
  const count = (db.prepare(`SELECT COUNT(*) as c FROM admins`).get() as { c: number }).c;
  if (count > 0) return;
  const login = "admin";
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  const pinHash = `${salt}:${hash}`;
  const info = db
    .prepare(`INSERT OR IGNORE INTO admins (id, name, login, pin_hash) VALUES (?, ?, ?, ?)`)
    .run("seed-admin", "Администратор", login, pinHash);
  if (info.changes === 0) return; // another worker already seeded the admin
  const credsPath = path.join(DATA_DIR, "admin-credentials.txt");
  fs.writeFileSync(
    credsPath,
    `Логин администратора: ${login}\nPIN: ${pin}\nСоздано автоматически при первом запуске. Файл не попадает в git.\n`
  );
  console.log(`[kompas] Создан администратор по умолчанию. Логин: ${login}, PIN: ${pin} (см. data/admin-credentials.txt)`);
}

seedDefaultAdmin();

export default db;
