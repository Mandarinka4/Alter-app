/* eslint-disable @next/next/no-img-element */
// view="full" shows the whole character (browsing, creating);
// view="face" is the same drawing cropped to the face (chat, lists).
export function Avatar({ seed, gender, size, view = "face", className = "" }: {
  seed: string; gender?: string; size?: number; view?: "face" | "full"; className?: string;
}) {
  const q = new URLSearchParams({ v: view, ...(gender ? { g: gender } : {}) });
  return (
    <img
      src={`/api/avatar/${encodeURIComponent(seed)}?${q}`}
      alt=""
      width={size}
      height={size}
      className={`${view === "full" ? "figure" : "avatar"} ${className}`}
      loading="lazy"
    />
  );
}
