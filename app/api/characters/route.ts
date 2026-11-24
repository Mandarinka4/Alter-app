import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { insertCharacter, listOwnCharacters } from "@/lib/characters";
import { GENDERS, PRESETS, TONES, TRAITS, defaultGreeting } from "@/lib/personas";

// Home screen data: presets, the user's own characters, and their chats
// (a chat counts once the user has written at least one message).
export async function GET() {
  const userId = await getUserId();
  const [own, last] = await Promise.all([
    listOwnCharacters(userId),
    query(
      `SELECT DISTINCT ON (character_id) character_id, role, content, created_at
       FROM messages WHERE user_id = $1
         AND character_id IN (SELECT character_id FROM messages WHERE user_id = $1 AND role = 'user')
       ORDER BY character_id, id DESC`,
      [userId]
    ),
  ]);
  const all = [...own, ...PRESETS];
  const chats = last
    .map((m) => {
      const character = all.find((c) => c.id === m.character_id);
      return character && { character, lastMessage: { role: m.role, content: m.content, at: m.created_at } };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => +new Date(b.lastMessage.at) - +new Date(a.lastMessage.at));
  return NextResponse.json({ presets: PRESETS, own, chats });
}

const MAX_IMAGE_CHARS = 600_000; // ~450 KB of image data

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export async function POST(req: Request) {
  const userId = await getUserId();
  const body = await req.json().catch(() => ({}));

  const name = clean(body.name, 30);
  const gender = GENDERS.some((g) => g.id === body.gender) ? body.gender : null;
  const tone = TONES.some((t) => t.id === body.tone) ? body.tone : null;
  const traits: string[] = Array.isArray(body.traits)
    ? [...new Set<string>(body.traits)].filter((t) => TRAITS.some((x) => x.id === t)).slice(0, 3)
    : [];
  const avatarSeed = clean(body.avatarSeed, 40) || crypto.randomUUID();

  if (!name || !gender || !tone || traits.length === 0) {
    return NextResponse.json({ error: "Name, gender, tone and at least one trait are required." }, { status: 400 });
  }
  const tagline = clean(body.tagline, 90) || `${TRAITS.find((t) => t.id === traits[0])!.label} soul who loves a good chat`;
  const backstory = typeof body.backstory === "string" ? body.backstory.trim().slice(0, 600) : "";

  // Optional uploaded picture: must be a small base64 image (the browser resizes it first).
  let image: string | null = null;
  if (body.image) {
    const ok = typeof body.image === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body.image);
    if (!ok || body.image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "That image couldn't be used. Try a JPG or PNG." }, { status: 400 });
    }
    image = body.image;
  }

  const count = await query("SELECT count(*)::int AS n FROM characters WHERE owner_id = $1", [userId]);
  if (count[0].n >= 20) return NextResponse.json({ error: "You've reached 20 characters." }, { status: 400 });

  const id = await insertCharacter(userId, {
    name, gender, tone, traits, avatarSeed, tagline, backstory,
    greeting: defaultGreeting(name, tone),
  }, image, image ? Math.min(3, Math.max(1, Number(body.faceZoom) || 1)) : null);
  return NextResponse.json({ id });
}
