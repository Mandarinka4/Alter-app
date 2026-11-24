/* eslint-disable @next/next/no-img-element */
// One component for every character picture.
//  - view="full": the whole character (browsing, creating)
//  - view="face": round avatar (chat, lists)
// A character either has a picture (`image`: uploaded or a preset illustration)
// or is drawn from its seed by /api/avatar.
type Props = {
  seed: string;
  gender?: string;
  image?: string;
  faceImage?: string;
  faceZoom?: number;
  size?: number;
  view?: "face" | "full";
  className?: string;
};

export function Avatar({ seed, gender, image, faceImage, faceZoom = 1, size, view = "face", className = "" }: Props) {
  if (image) {
    if (view === "full") return <img src={image} alt="" className={`figure photo ${className}`} loading="lazy" />;
    if (faceImage) return <img src={faceImage} alt="" width={size} height={size} className={`avatar photo ${className}`} loading="lazy" />;
    // Zoom into the top-centre of the picture: 1 = whole width, 3 = a face in a full-body drawing.
    const y = Math.max(4, 30 - (faceZoom - 1) * 13);
    return (
      <span
        role="img"
        aria-label=""
        className={`avatar photo-bg ${className}`}
        style={{ width: size, height: size, backgroundImage: `url("${image}")`, backgroundSize: `${faceZoom * 100}%`, backgroundPosition: `50% ${y}%` }}
      />
    );
  }
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

/** Convenience: pass a whole character. */
export function CharacterPic({ c, ...rest }: { c: { avatarSeed: string; gender: string; image?: string; faceImage?: string; faceZoom?: number } } & Omit<Props, "seed" | "gender" | "image" | "faceImage" | "faceZoom">) {
  return <Avatar seed={c.avatarSeed} gender={c.gender} image={c.image} faceImage={c.faceImage} faceZoom={c.faceZoom} {...rest} />;
}
