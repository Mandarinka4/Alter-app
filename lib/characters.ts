import { query } from "./db";
import { PRESETS, type Character } from "./personas";

function fromRow(r: any): Character {
  return {
    id: r.id, name: r.name, gender: r.gender, tagline: r.tagline,
    backstory: r.backstory, traits: r.traits, tone: r.tone,
    avatarSeed: r.avatar_seed, greeting: r.greeting, preset: false,
  };
}

/** A user can open any preset, or a custom character they created. */
export async function getCharacter(id: string, userId: string): Promise<Character | null> {
  const preset = PRESETS.find((p) => p.id === id);
  if (preset) return preset;
  const rows = await query("SELECT * FROM characters WHERE id = $1 AND owner_id = $2", [id, userId]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function listOwnCharacters(userId: string): Promise<Character[]> {
  const rows = await query("SELECT * FROM characters WHERE owner_id = $1 ORDER BY created_at DESC", [userId]);
  return rows.map(fromRow);
}

export async function insertCharacter(userId: string, c: Omit<Character, "id" | "preset">): Promise<string> {
  const id = "c_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  await query(
    `INSERT INTO characters (id, owner_id, name, gender, tagline, backstory, traits, tone, avatar_seed, greeting)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, userId, c.name, c.gender, c.tagline, c.backstory, JSON.stringify(c.traits), c.tone, c.avatarSeed, c.greeting]
  );
  return id;
}
