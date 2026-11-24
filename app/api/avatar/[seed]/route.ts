import { renderAvatar } from "@/lib/avatar";

// Characters are drawn on the fly from a seed (+ gender) and cached forever:
// no image storage or hosting needed. ?v=full for the whole figure.
export async function GET(req: Request, ctx: { params: Promise<{ seed: string }> }) {
  const { seed } = await ctx.params;
  const url = new URL(req.url);
  const gender = url.searchParams.get("g") ?? undefined;
  const view = url.searchParams.get("v") === "full" ? "full" : "face";
  return new Response(renderAvatar(decodeURIComponent(seed), gender, view), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
