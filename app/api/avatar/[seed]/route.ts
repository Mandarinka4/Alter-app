import { renderAvatar } from "@/lib/avatar";

// Generated on the fly from a seed (+ gender) and cached forever: no image
// storage or hosting needed.
export async function GET(req: Request, ctx: { params: Promise<{ seed: string }> }) {
  const { seed } = await ctx.params;
  const gender = new URL(req.url).searchParams.get("g") ?? undefined;
  return new Response(renderAvatar(decodeURIComponent(seed), gender), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
