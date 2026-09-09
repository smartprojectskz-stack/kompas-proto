import { createClient, type InValue } from "@libsql/client";
import path from "path";
import fs from "fs";
import { scryptSync, randomBytes } from "crypto";

// On Vercel (and other read-only-filesystem serverless hosts) only /tmp is writable, and it
// isn't guaranteed to persist across invocations — set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN)
// to point at a real libSQL/Turso database for a persistent deployment.
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = path.join(isServerless ? "/tmp" : process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "kompas.db");

const url = process.env.TURSO_DATABASE_URL ?? `file:${DB_PATH}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

declare global {
  var __kompasClient: ReturnType<typeof createClient> | undefined;
}

const client =
  global.__kompasClient ?? createClient(authToken ? { url, authToken } : { url });
if (process.env.NODE_ENV !== "production") global.__kompasClient = client;

const SCHEMA_SQL = `
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
  age_group TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🙂',
  pin_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood_key TEXT NOT NULL,
  mood_value INTEGER NOT NULL,
  note TEXT,
  prompt_answer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_observations (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, week_start)
);

CREATE TABLE IF NOT EXISTS dilemma_responses (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  dilemma_key TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS biweekly_reports (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  domain_scores_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, period_start)
);

CREATE TABLE IF NOT EXISTS gatekeeper_answers (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  answer INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
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
  role TEXT NOT NULL,
  family_id TEXT,
  parent_id TEXT,
  child_id TEXT,
  admin_id TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// Seed a default admin account on first run so /admin/login is reachable out of the box.
// Uses INSERT OR IGNORE + a fixed row id because multiple workers/instances can each run
// this against the same database concurrently.
async function seedDefaultAdmin() {
  const rs = await client.execute(`SELECT COUNT(*) as c FROM admins`);
  const count = Number((rs.rows[0] as unknown as { c: number | bigint }).c);
  if (count > 0) return;
  const login = "admin";
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  const pinHash = `${salt}:${hash}`;
  const info = await client.execute({
    sql: `INSERT OR IGNORE INTO admins (id, name, login, pin_hash) VALUES (?, ?, ?, ?)`,
    args: ["seed-admin", "Администратор", login, pinHash],
  });
  if (info.rowsAffected === 0) return; // another worker already seeded the admin
  const credsPath = path.join(DATA_DIR, "admin-credentials.txt");
  try {
    fs.writeFileSync(
      credsPath,
      `Логин администратора: ${login}\nPIN: ${pin}\nСоздано автоматически при первом запуске. Файл не попадает в git.\n`
    );
  } catch {
    // read-only filesystem (e.g. some serverless hosts) — credentials still land in the log line below.
  }
  console.log(
    `[kompas] Создан администратор по умолчанию. Логин: ${login}, PIN: ${pin} (см. data/admin-credentials.txt)`
  );
}

let ready: Promise<void> | undefined;
function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await client.executeMultiple(SCHEMA_SQL);
      await seedDefaultAdmin();
    })();
  }
  return ready;
}

// libSQL rows come back as null-prototype, non-enumerable-index objects — fine for our own
// code, but React Server Components refuse to pass them as props to Client Components
// ("Only plain objects... are supported"). Spreading into a fresh object fixes that.
function toPlainRow<T>(row: unknown): T {
  return { ...(row as Record<string, unknown>) } as T;
}

export async function dbGet<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = []
): Promise<T | undefined> {
  await ensureReady();
  const rs = await client.execute({ sql, args });
  return rs.rows[0] ? toPlainRow<T>(rs.rows[0]) : undefined;
}

export async function dbAll<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = []
): Promise<T[]> {
  await ensureReady();
  const rs = await client.execute({ sql, args });
  return rs.rows.map((row) => toPlainRow<T>(row));
}

export interface RunResult {
  changes: number;
  lastInsertRowid: bigint | undefined;
}

export async function dbRun(sql: string, args: InValue[] = []): Promise<RunResult> {
  await ensureReady();
  const rs = await client.execute({ sql, args });
  return { changes: Number(rs.rowsAffected), lastInsertRowid: rs.lastInsertRowid };
}

export interface BatchStatement {
  sql: string;
  args?: InValue[];
}

/** Runs statements as a single atomic transaction. */
export async function dbBatch(statements: BatchStatement[]): Promise<void> {
  await ensureReady();
  await client.batch(
    statements.map((s) => ({ sql: s.sql, args: s.args ?? [] })),
    "write"
  );
}
