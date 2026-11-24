// Four-point chrome star, the signature ornament of the metallic Y2K look.
let n = 0;
export function Sparkle({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const id = `chrome-${n++}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`sparkle ${className}`} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#c9cfdc" />
          <stop offset=".5" stopColor="#7d8397" />
          <stop offset=".56" stopColor="#f4f7ff" />
          <stop offset="1" stopColor="#9aa2b6" />
        </linearGradient>
      </defs>
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0Z" fill={`url(#${id})`} />
    </svg>
  );
}
