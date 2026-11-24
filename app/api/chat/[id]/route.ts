import { NextResponse, after } from "next/server";
import { query } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { getCharacter } from "@/lib/characters";
import { getMemory, getRecentMessages, maybeUpdateMemory } from "@/lib/memory";
import { buildMessages } from "@/lib/prompt";
import { LLMError, openChatStream } from "@/lib/llm";

export const maxDuration = 60;

const MAX_LEN = 2000;
const HOURLY_LIMIT = 80; // per anonymous user, protects the free API quota

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = await getUserId();
  const character = await getCharacter(id, userId);
  if (!character) return NextResponse.json({ error: "Character not found." }, { status: 404 });

  const { text } = await req.json().catch(() => ({}));
  const content = typeof text === "string" ? text.trim().slice(0, MAX_LEN) : "";
  if (!content) return NextResponse.json({ error: "Empty message." }, { status: 400 });

  const recent = await query(
    "SELECT count(*)::int AS n FROM messages WHERE user_id = $1 AND role = 'user' AND created_at > now() - interval '1 hour'",
    [userId]
  );
  if (recent[0].n >= HOURLY_LIMIT) {
    return NextResponse.json({ error: "You've sent a lot of messages this hour. Take a breather and come back soon." }, { status: 429 });
  }

  const [inserted] = await query(
    "INSERT INTO messages (user_id, character_id, role, content) VALUES ($1, $2, 'user', $3) RETURNING id",
    [userId, id, content]
  );

  const [memory, history] = await Promise.all([getMemory(userId, id), getRecentMessages(userId, id)]);

  let tokens: AsyncGenerator<string>;
  try {
    tokens = await openChatStream(buildMessages(character, memory, history));
  } catch (e) {
    // Roll back so a retry doesn't duplicate the user's message.
    await query("DELETE FROM messages WHERE id = $1", [inserted.id]);
    const status = e instanceof LLMError ? (e.status === 429 ? 429 : 502) : 500;
    const error = e instanceof LLMError ? e.message : "Something went wrong.";
    return NextResponse.json({ error }, { status });
  }

  // Update long-term memory once the response is finished (doesn't delay the reply).
  after(() => maybeUpdateMemory(userId, character).catch((e) => console.error("memory update failed", e)));

  const encoder = new TextEncoder();
  let reply = "";
  let saved = false;
  const save = async () => {
    if (saved || !reply.trim()) return;
    saved = true;
    await query(
      "INSERT INTO messages (user_id, character_id, role, content) VALUES ($1, $2, 'assistant', $3)",
      [userId, id, reply.trim()]
    );
  };

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await tokens.next();
        if (done) {
          await save();
          controller.close();
          return;
        }
        reply += value;
        controller.enqueue(encoder.encode(value));
      } catch (e) {
        console.error("stream failed", e);
        await save();
        controller.error(e);
      }
    },
    async cancel() {
      // User navigated away mid-reply: keep what was said so far.
      await tokens.return(undefined);
      await save();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
