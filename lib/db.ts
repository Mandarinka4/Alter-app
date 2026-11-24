// Tiny Postgres access layer.
// Production: Neon serverless Postgres over HTTP (free tier, set DATABASE_URL).
// Local dev:  PGlite, an embedded Postgres compiled to WASM, so the exact same
//             SQL runs with zero setup.

type Row = Record<string, any>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS characters (
     id          TEXT PRIMARY KEY,
     owner_id    TEXT NOT NULL,
     name        TEXT NOT NULL,
     gender      TEXT NOT NULL,
     tagline     TEXT NOT NULL,
     backstory   TEXT NOT NULL DEFAULT '',
     traits      JSONB NOT NULL,
     tone        TEXT NOT NULL,
     avatar_seed TEXT NOT NULL,
     greeting    TEXT NOT NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS characters_owner ON characters(owner_id)`,
  `CREATE TABLE IF NOT EXISTS messages (
     id           BIGSERIAL PRIMARY KEY,
     user_id      TEXT NOT NULL,
     character_id TEXT NOT NULL,
     role         TEXT NOT NULL CHECK (role IN ('user','assistant')),
     content      TEXT NOT NULL,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS messages_thread ON messages(user_id, character_id, id)`,
  `CREATE TABLE IF NOT EXISTS memories (
     user_id        TEXT NOT NULL,
     character_id   TEXT NOT NULL,
     summary        TEXT NOT NULL DEFAULT '',
     facts          JSONB NOT NULL DEFAULT '[]',
     processed_upto BIGINT NOT NULL DEFAULT 0,
     updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (user_id, character_id)
   )`,
];

let ready: Promise<QueryFn> | null = null;

async function connect(): Promise<QueryFn> {
  let run: QueryFn;
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    run = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync } = await import("node:fs");
    mkdirSync("./.data", { recursive: true });
    const db = new PGlite("./.data/pglite");
    run = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }
  for (const stmt of SCHEMA) await run(stmt);
  return run;
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!ready) ready = connect().catch((e) => { ready = null; throw e; });
  const run = await ready;
  return (await run(text, params)) as T[];
}
