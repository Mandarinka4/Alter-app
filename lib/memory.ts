// Two-layer memory per (user, character):
//
//  1. Short-term: the last HISTORY_WINDOW messages go to the model verbatim.
//  2. Long-term: a small "memory card" = a list of facts about the user and a
//     running summary of the relationship. Every MEMORY_EVERY new messages a
//     cheap background call (small model) folds the new messages into it.
//
// The card goes into the system prompt, so cost per reply stays flat no
// matter how long the conversation gets, and old details are still
// remembered. All raw messages are kept in Postgres as well.

import { query } from "./db";
import { completeJSON, isMock, type ChatMessage } from "./llm";
import type { Character } from "./personas";

export const HISTORY_WINDOW = 20;
const MEMORY_EVERY = 6;
const MAX_FACTS = 25;

export type Memory = { summary: string; facts: string[]; processedUpto: number };

export async function getMemory(userId: string, characterId: string): Promise<Memory> {
  const rows = await query(
    "SELECT summary, facts, processed_upto FROM memories WHERE user_id = $1 AND character_id = $2",
    [userId, characterId]
  );
  const r = rows[0];
  return r
    ? { summary: r.summary, facts: r.facts ?? [], processedUpto: Number(r.processed_upto) }
    : { summary: "", facts: [], processedUpto: 0 };
}

export async function getRecentMessages(userId: string, characterId: string, limit = HISTORY_WINDOW) {
  const rows = await query(
    `SELECT id, role, content, created_at FROM messages
     WHERE user_id = $1 AND character_id = $2 ORDER BY id DESC LIMIT $3`,
    [userId, characterId, limit]
  );
  return rows.reverse().map((r) => ({
    id: Number(r.id), role: r.role as "user" | "assistant", content: r.content as string, createdAt: r.created_at,
  }));
}

/** Runs after a reply has been sent (see `after()` in the chat route). */
export async function maybeUpdateMemory(userId: string, c: Character): Promise<void> {
  const memory = await getMemory(userId, c.id);
  const fresh = await query(
    `SELECT id, role, content FROM messages
     WHERE user_id = $1 AND character_id = $2 AND id > $3 ORDER BY id ASC LIMIT 40`,
    [userId, c.id, memory.processedUpto]
  );
  if (fresh.length < MEMORY_EVERY) return;

  const transcript = fresh
    .map((m) => `${m.role === "user" ? "User" : c.name}: ${m.content}`)
    .join("\n");

  const updated = isMock
    ? mockMemory(memory, fresh)
    : await llmMemory(c, memory, transcript);

  const lastId = Number(fresh[fresh.length - 1].id);
  await query(
    `INSERT INTO memories (user_id, character_id, summary, facts, processed_upto, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id, character_id)
     DO UPDATE SET summary = $3, facts = $4, processed_upto = $5, updated_at = now()`,
    [userId, c.id, updated.summary, JSON.stringify(updated.facts), lastId]
  );
}

async function llmMemory(c: Character, memory: Memory, transcript: string) {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You maintain the long-term memory of ${c.name}, an AI companion, about the user they chat with.
Return JSON: {"facts": string[], "summary": string}.
- facts: durable things about the USER (name, job, people in their life, likes, plans, worries, important events, how they like to be treated). Short, third person ("Works as a nurse", "Has a dog named Bo", "Job interview on Friday"). Merge with existing facts: keep them, update ones that changed, drop duplicates. Max ${MAX_FACTS}. Never invent anything.
- summary: 2 to 4 sentences, written from ${c.name}'s point of view, about the relationship and the main things discussed so far, including inside jokes or promises. Merge the old summary with the new messages.`,
    },
    {
      role: "user",
      content: `Existing facts:\n${JSON.stringify(memory.facts)}\n\nExisting summary:\n${memory.summary || "(none)"}\n\nNew messages:\n${transcript}`,
    },
  ];
  const out = await completeJSON(messages);
  const facts = Array.isArray(out.facts)
    ? out.facts.filter((f: unknown) => typeof f === "string" && f.trim()).slice(0, MAX_FACTS)
    : memory.facts;
  const summary = typeof out.summary === "string" ? out.summary.slice(0, 1200) : memory.summary;
  return { facts, summary };
}

// Offline fallback so memory is demonstrable without an API key.
function mockMemory(memory: Memory, fresh: any[]) {
  const facts = [...memory.facts];
  for (const m of fresh.filter((m) => m.role === "user")) {
    const name = m.content.match(/my name is (\w+)/i);
    if (name) facts.push(`Name is ${name[1]}`);
    const likes = m.content.match(/i (?:really )?(?:like|love) ([^.!?,]+)/i);
    if (likes) facts.push(`Likes ${likes[1].trim()}`);
  }
  return {
    facts: [...new Set(facts)].slice(0, MAX_FACTS),
    summary: `(mock) ${fresh.length} more messages exchanged.`,
  };
}
