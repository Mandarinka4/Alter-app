import { query } from "@/lib/db";
import { getUserId } from "@/lib/user";

// Serves a character's uploaded picture. Pictures are private: only the
// user who created the character can load it.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = await getUserId();
  const rows = await query("SELECT image FROM characters WHERE id = $1 AND owner_id = $2 AND image IS NOT NULL", [id, userId]);
  const m = rows[0]?.image?.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=86400" },
  });
}
