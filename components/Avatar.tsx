/* eslint-disable @next/next/no-img-element */
export function Avatar({ seed, gender, size, className = "" }: { seed: string; gender?: string; size?: number; className?: string }) {
  const q = gender ? `?g=${gender}` : "";
  return (
    <img src={`/api/avatar/${encodeURIComponent(seed)}${q}`} alt="" width={size} height={size} className={`avatar ${className}`} loading="lazy" />
  );
}
