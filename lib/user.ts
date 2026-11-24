import { cookies } from "next/headers";

// No sign-up for the MVP: each browser gets an anonymous id in an httpOnly
// cookie. Characters and chats hang off that id, so they survive reloads and
// coming back days later on the same device.
const COOKIE = "kid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getUserId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
  const id = crypto.randomUUID();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}
