import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { getCharacter } from "@/lib/characters";
import { getMemory, getRecentMessages } from "@/lib/memory";

type Ctx = { params: Promise<{ id: string }> };

// Opens a conversation: character, recent messages, and the memory card.
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const userId = await getUserId();
  const character = await getCharacter(id, userId);
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let messages = await getRecentMessages(userId, id, 100);
  if (messages.length === 0) {
    // First visit: the character speaks first, and that greeting is part of the history.
    await query(
      "INSERT INTO messages (user_id, character_id, role, content) VALUES ($1, $2, 'assistant', $3)",
      [userId, id, character.greeting]
    );
    messages = await getRecentMessages(userId, id, 100);
  }
  const memory = await getMemory(userId, id);
  return NextResponse.json({ character, messages, memory: { facts: memory.facts, summary: memory.summary } });
}

// "Start over": wipes this conversation and everything the character remembers.
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const userId = await getUserId();
  await query("DELETE FROM messages WHERE user_id = $1 AND character_id = $2", [userId, id]);
  await query("DELETE FROM memories WHERE user_id = $1 AND character_id = $2", [userId, id]);
  return NextResponse.json({ ok: true });
}
