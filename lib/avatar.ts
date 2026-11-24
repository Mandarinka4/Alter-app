// Original, hand-coded cartoon characters (no external art).
// One parametric SVG drawing of the full body; the chat avatar is the same
// drawing cropped to the face with a different viewBox. Soft, rounded shapes
// only: capsules, ellipses and curves.

type HairStyle = "buzz" | "short" | "swept" | "bob" | "long" | "bun" | "ponytail" | "curly";
type Outfit = "tank" | "tee" | "hoodie" | "blazer" | "tweed" | "cardigan";
type Prop = "dumbbell" | "tea" | "tablet" | "book" | "phone";

export type Look = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  outfit: Outfit;
  top: string;      // main clothing colour
  inner: string;    // shirt under jacket / dress under cardigan
  bottom: string;   // trousers or skirt
  shoes: string;
  build: "slim" | "normal" | "broad";
  skirt?: boolean;
  glasses?: boolean;
  earrings?: string;
  beard?: "stubble" | "full";
  old?: boolean;
  brows: "soft" | "stern" | "raised";
  mouth: "smile" | "grin" | "smirk" | "calm";
  prop?: Prop;
  accent: string;
};

const INK = "#3a2f4d";
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

const PRESET_LOOKS: Record<string, Look> = {
  "max-gym-1": {
    skin: "#e2a87e", hair: "#2a2320", hairStyle: "buzz", outfit: "tank", top: "#44495a", inner: "#44495a",
    bottom: "#2f3442", shoes: "#20222b", build: "broad", beard: "stubble", brows: "stern", mouth: "calm",
    prop: "dumbbell", accent: "#c9ccd6",
  },
  "rose-granny-3": {
    skin: "#f3d0b8", hair: "#e4e2ea", hairStyle: "bun", outfit: "cardigan", top: "#b99ad6", inner: "#f6e6ef",
    bottom: "#f6e6ef", skirt: true, shoes: "#7a5a6e", build: "normal", glasses: true, earrings: "#ffffff",
    old: true, brows: "soft", mouth: "smile", prop: "tea", accent: "#f7a8c4",
  },
  "victoria-ceo-7": {
    skin: "#efc3a1", hair: "#4a2a1c", hairStyle: "bob", outfit: "blazer", top: "#2e3250", inner: "#f4f4f8",
    bottom: "#2e3250", shoes: "#16182a", build: "slim", earrings: "#e8c56a", brows: "raised", mouth: "smirk",
    prop: "tablet", accent: "#e8c56a",
  },
  "leo-prof-5": {
    skin: "#e7b691", hair: "#d6d6de", hairStyle: "swept", outfit: "tweed", top: "#8b6a50", inner: "#f4efe6",
    bottom: "#55483d", shoes: "#3a2a22", build: "normal", glasses: true, beard: "full", old: true,
    brows: "raised", mouth: "smile", prop: "book", accent: "#c0394f",
  },
  "zoe-teen-2": {
    skin: "#f0c29e", hair: "#f49ac1", hairStyle: "ponytail", outfit: "hoodie", top: "#b8a8ff", inner: "#b8a8ff",
    bottom: "#3d4270", shoes: "#f4f4fa", build: "slim", earrings: "#d7dbe8", brows: "soft", mouth: "grin",
    prop: "phone", accent: "#9fe6ff",
  },
};

// ------------------------------------------------------------ random looks

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: string) {
  let x = hash(seed) || 1;
  return () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)) >>> 0) / 4294967296;
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

const SKINS = ["#f6d5bf", "#efc3a1", "#e2a87e", "#c68a62", "#9a6446", "#6e4430"];
const NATURAL = ["#2a2320", "#4a2a1c", "#7a4a2a", "#b5763c", "#e0b86a", "#c9563a"];
const FUN = ["#f49ac1", "#9fe6ff", "#b8a8ff", "#a6f0c6"];
const CLOTHES = ["#b8a8ff", "#9fd3ff", "#ffb3c7", "#a6e8c8", "#ffd59e", "#44495a", "#2e3250", "#e9e9f2"];
const BOTTOMS = ["#3d4270", "#2f3442", "#55483d", "#6a7594", "#e9e9f2"];

export function lookFor(seed: string, gender?: string): Look {
  if (PRESET_LOOKS[seed]) return PRESET_LOOKS[seed];
  const r = rng(seed);
  const female = gender === "female";
  const male = gender === "male";
  const hairStyle: HairStyle = female
    ? pick(r, ["bob", "long", "ponytail", "curly", "bun"])
    : male ? pick(r, ["buzz", "short", "swept", "curly"])
    : pick(r, ["short", "bob", "curly", "ponytail", "swept"]);
  const outfit: Outfit = pick(r, female ? ["tee", "hoodie", "blazer", "cardigan"] : ["tee", "hoodie", "blazer", "tank"]);
  return {
    skin: pick(r, SKINS),
    hair: pick(r, male || female ? [...NATURAL, ...NATURAL, FUN[Math.floor(r() * 4)]] : [...NATURAL, ...FUN]),
    hairStyle,
    outfit,
    top: pick(r, CLOTHES),
    inner: pick(r, ["#f4f4f8", "#ffe9a8", "#d8f3ff"]),
    bottom: pick(r, BOTTOMS),
    skirt: female && r() < 0.4,
    shoes: pick(r, ["#20222b", "#f4f4fa", "#7a5a6e"]),
    build: male ? pick(r, ["normal", "broad"]) : female ? pick(r, ["slim", "normal"]) : pick(r, ["slim", "normal"]),
    glasses: r() < 0.22,
    earrings: female && r() < 0.5 ? pick(r, ["#e8c56a", "#d7dbe8"]) : undefined,
    beard: male && r() < 0.25 ? pick(r, ["stubble", "full"]) : undefined,
    brows: pick(r, ["soft", "soft", "raised", "stern"]),
    mouth: pick(r, ["smile", "smile", "grin", "smirk"]),
    accent: pick(r, ["#ffb3c7", "#9fe6ff", "#e8c56a"]),
  };
}

// ------------------------------------------------------------ drawing

const darken = (hex: string, amt = 0.18) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amt)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("")}`;
};

function hairBack(l: Look): string {
  const c = l.hair;
  switch (l.hairStyle) {
    case "bob": return `<path d="M40 94 Q38 30 100 30 Q162 30 160 94 L161 134 Q161 146 149 146 L51 146 Q39 146 39 134Z" fill="${c}" ${S}/>`;
    case "long": return `<path d="M38 92 Q38 28 100 28 Q162 28 162 92 L166 192 Q166 206 150 204 Q136 202 132 190 L68 190 Q64 202 50 204 Q34 206 34 192Z" fill="${c}" ${S}/>`;
    case "bun": return `<circle cx="100" cy="34" r="20" fill="${c}" ${S}/>`;
    case "ponytail": return `<path d="M138 58 Q190 62 182 128 Q178 150 164 146 Q154 142 160 122 Q170 92 136 80Z" fill="${c}" ${S}/><circle cx="144" cy="66" r="7" fill="${l.accent}" ${S}/>`;
    case "curly": return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = Math.PI * (0.95 + i * 0.185);
      return `<circle cx="${100 + 58 * Math.cos(a)}" cy="${96 + 58 * Math.sin(a)}" r="16" fill="${c}" ${S}/>`;
    }).join("") + `<circle cx="44" cy="112" r="15" fill="${c}" ${S}/><circle cx="156" cy="112" r="15" fill="${c}" ${S}/>`;
    default: return "";
  }
}

function hairFront(l: Look): string {
  const c = l.hair;
  switch (l.hairStyle) {
    case "buzz": return `<path d="M52 92 Q50 42 100 42 Q150 42 148 92 Q142 70 100 68 Q58 70 52 92Z" fill="${c}" ${S}/>`;
    case "short": return `<path d="M48 98 Q42 36 100 34 Q158 36 152 98 Q148 74 132 68 Q120 80 102 72 Q86 82 70 68 Q54 76 48 98Z" fill="${c}" ${S}/>`;
    case "swept": return `<path d="M48 100 Q40 36 104 36 Q160 40 152 100 Q150 74 138 64 Q112 78 82 62 Q60 72 48 100Z" fill="${c}" ${S}/>`;
    case "bob": return `<path d="M50 94 Q48 38 100 38 Q152 38 150 94 Q146 78 136 80 Q126 64 112 78 Q100 64 88 78 Q74 64 64 80 Q54 78 50 94Z" fill="${c}" ${S}/>`;
    case "long": return `<path d="M50 98 Q46 36 100 36 Q154 36 150 98 Q142 62 112 58 Q98 76 64 78 Q54 84 50 98Z" fill="${c}" ${S}/>`;
    case "bun": return `<path d="M50 96 Q48 40 100 40 Q152 40 150 96 Q140 62 100 62 Q60 62 50 96Z" fill="${c}" ${S}/>`;
    case "ponytail": return `<path d="M50 96 Q46 38 100 38 Q154 38 150 96 Q140 66 118 64 Q104 82 78 80 Q60 80 50 96Z" fill="${c}" ${S}/>`;
    case "curly": return [0, 1, 2, 3, 4].map((i) => `<circle cx="${64 + i * 18}" cy="${54 - Math.sin((i / 4) * Math.PI) * 10}" r="15" fill="${c}" ${S}/>`).join("");
  }
}

function face(l: Look): string {
  const eyeY = l.glasses ? 102 : 100;
  const eyes = [82, 118].map((x) =>
    `<ellipse cx="${x}" cy="${eyeY}" rx="5.5" ry="7" fill="${INK}"/><circle cx="${x + 2}" cy="${eyeY - 3}" r="2.2" fill="#fff"/>`
  ).join("");
  const brows = {
    soft: `<path d="M74 86 Q82 81 90 85 M110 85 Q118 81 126 86" fill="none" ${S}/>`,
    stern: `<path d="M72 84 Q82 86 91 91 M109 91 Q118 86 128 84" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    raised: `<path d="M74 84 Q82 77 90 82 M110 82 Q118 77 126 84" fill="none" ${S}/>`,
  }[l.brows];
  const mouth = {
    smile: `<path d="M91 117 Q100 126 109 117" fill="none" ${S}/>`,
    grin: `<path d="M89 116 Q100 116 111 116 Q108 130 100 130 Q92 130 89 116Z" fill="#7a2f45" ${S}/><path d="M93 124 Q100 128 107 124" fill="none" stroke="#ff8fa8" stroke-width="3" stroke-linecap="round"/>`,
    smirk: `<path d="M92 120 Q102 124 110 116" fill="none" ${S}/>`,
    calm: `<path d="M93 120 Q100 122 107 120" fill="none" ${S}/>`,
  }[l.mouth];
  const blush = `<ellipse cx="70" cy="114" rx="8" ry="5" fill="#ff8fa8" opacity=".35"/><ellipse cx="130" cy="114" rx="8" ry="5" fill="#ff8fa8" opacity=".35"/>`;
  const nose = `<path d="M98 108 Q101 111 98 113" fill="none" stroke="${darken(l.skin, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>`;
  const wrinkles = l.old ? `<path d="M64 98 l-5 -2 M64 104 l-5 1 M136 98 l5 -2 M136 104 l5 1" stroke="${darken(l.skin, 0.35)}" stroke-width="2" stroke-linecap="round"/>` : "";
  const beard = l.beard === "full"
    ? `<path d="M60 108 Q62 146 100 148 Q138 146 140 108 Q132 126 116 124 Q100 116 84 124 Q68 126 60 108Z" fill="${l.hair}" ${S}/>${mouth}`
    : l.beard === "stubble" ? `<path d="M58 110 Q62 144 100 146 Q138 144 142 110 Q132 132 100 134 Q68 132 58 110Z" fill="${INK}" opacity=".13"/>` : "";
  const glasses = l.glasses
    ? `<circle cx="82" cy="102" r="13" fill="#fff" fill-opacity=".18" ${S}/><circle cx="118" cy="102" r="13" fill="#fff" fill-opacity=".18" ${S}/><path d="M95 102 Q100 98 105 102 M69 100 L56 96 M131 100 L144 96" fill="none" ${S}/>`
    : "";
  const earrings = l.earrings ? `<circle cx="51" cy="114" r="4.5" fill="${l.earrings}" ${S}/><circle cx="149" cy="114" r="4.5" fill="${l.earrings}" ${S}/>` : "";
  return blush + eyes + brows + nose + wrinkles + (l.beard === "full" ? beard : mouth + beard) + glasses + earrings;
}

function body(l: Look): string {
  const w = l.build === "broad" ? 104 : l.build === "slim" ? 72 : 82;
  const x0 = 100 - w / 2, x1 = 100 + w / 2;
  const armW = l.build === "broad" ? 30 : 22;
  const sleeve = l.outfit === "tank" ? null : l.outfit === "tee" ? "short" : "long";
  const armColor = sleeve === "long" ? l.top : l.skin;
  const out: string[] = [];

  // legs + shoes
  if (l.skirt) {
    out.push(`<rect x="80" y="236" width="16" height="66" rx="8" fill="${l.skin}" ${S}/><rect x="104" y="236" width="16" height="66" rx="8" fill="${l.skin}" ${S}/>`);
  } else {
    out.push(`<rect x="${100 - 30}" y="232" width="28" height="74" rx="13" fill="${l.bottom}" ${S}/><rect x="102" y="232" width="28" height="74" rx="13" fill="${l.bottom}" ${S}/>`);
  }
  out.push(`<ellipse cx="82" cy="310" rx="19" ry="9" fill="${l.shoes}" ${S}/><ellipse cx="118" cy="310" rx="19" ry="9" fill="${l.shoes}" ${S}/>`);

  // arms (drawn behind torso), hands
  const arm = (side: -1 | 1) => {
    const sx = side < 0 ? x0 + 6 : x1 - 6;
    const ex = sx + side * 16;
    const parts = [`<path d="M${sx} 162 Q${sx + side * 14} 196 ${ex} 228" fill="none" stroke="${INK}" stroke-width="${armW + 6}" stroke-linecap="round"/>`,
      `<path d="M${sx} 162 Q${sx + side * 14} 196 ${ex} 228" fill="none" stroke="${armColor}" stroke-width="${armW}" stroke-linecap="round"/>`];
    if (sleeve === "short") parts.push(`<path d="M${sx} 162 Q${sx + side * 6} 178 ${sx + side * 8} 186" fill="none" stroke="${l.top}" stroke-width="${armW + 2}" stroke-linecap="round"/>`);
    if (l.build === "broad") parts.push(`<path d="M${sx + side * 8} 178 Q${sx + side * 20} 186 ${sx + side * 12} 198" fill="none" stroke="${darken(l.skin, 0.22)}" stroke-width="2.5" stroke-linecap="round"/>`);
    parts.push(`<circle cx="${ex}" cy="232" r="${armW / 2 + 2}" fill="${l.skin}" ${S}/>`);
    return parts.join("");
  };
  out.push(arm(-1), arm(1));

  // neck
  out.push(`<rect x="90" y="132" width="20" height="24" rx="8" fill="${darken(l.skin, 0.08)}" ${S}/>`);

  // hood behind shoulders
  if (l.outfit === "hoodie") out.push(`<path d="M70 150 Q100 132 130 150 Q120 164 100 164 Q80 164 70 150Z" fill="${darken(l.top, 0.12)}" ${S}/>`);

  // torso (+ skirt)
  if (l.skirt) out.push(`<path d="M${x0 + 4} 214 L${x0 - 14} 262 Q100 276 ${x1 + 14} 262 L${x1 - 4} 214Z" fill="${l.bottom}" ${S}/>`);
  const torsoFill = l.outfit === "cardigan" ? l.inner : l.top;
  out.push(`<rect x="${x0}" y="148" width="${w}" height="${l.skirt ? 76 : 92}" rx="${w * 0.36}" fill="${torsoFill}" ${S}/>`);

  // outfit details
  switch (l.outfit) {
    case "tank":
      out.push(`<path d="M${x0 + 12} 152 Q100 176 ${x1 - 12} 152" fill="${l.skin}" ${S}/>`);
      break;
    case "tee":
      out.push(`<path d="M88 150 Q100 162 112 150" fill="none" ${S}/>`);
      break;
    case "hoodie":
      out.push(`<path d="M93 160 L91 182 M107 160 L109 182" fill="none" stroke="${l.inner === l.top ? "#fff" : l.inner}" stroke-width="3" stroke-linecap="round"/>`,
        `<rect x="${100 - w * 0.3}" y="200" width="${w * 0.6}" height="22" rx="10" fill="${darken(l.top, 0.08)}" ${S}/>`);
      break;
    case "blazer":
    case "tweed":
      out.push(`<path d="M86 150 L100 184 L114 150Z" fill="${l.inner}" ${S}/>`,
        `<path d="M86 150 L96 190 L${x0 + 8} 168 M114 150 L104 190 L${x1 - 8} 168" fill="${darken(l.top, 0.1)}" ${S}/>`,
        `<circle cx="100" cy="206" r="3.5" fill="${INK}"/><circle cx="100" cy="220" r="3.5" fill="${INK}"/>`);
      if (l.outfit === "tweed") out.push(`<path d="M90 152 L100 158 L90 164Z M110 152 L100 158 L110 164Z" fill="${l.accent}" ${S}/>`);
      else out.push(`<path d="M90 152 Q100 168 110 152" fill="none" stroke="${l.accent}" stroke-width="3"/><circle cx="100" cy="166" r="3.5" fill="${l.accent}"/>`);
      break;
    case "cardigan":
      out.push(`<path d="M${x0} ${148 + w * 0.36} Q${x0} 148 ${100 - 8} 150 L94 ${l.skirt ? 224 : 240} L${x0 + 14} ${l.skirt ? 224 : 240} Q${x0} ${l.skirt ? 224 : 240} ${x0} 210Z" fill="${l.top}" ${S}/>`,
        `<path d="M${x1} ${148 + w * 0.36} Q${x1} 148 ${100 + 8} 150 L106 ${l.skirt ? 224 : 240} L${x1 - 14} ${l.skirt ? 224 : 240} Q${x1} ${l.skirt ? 224 : 240} ${x1} 210Z" fill="${l.top}" ${S}/>`,
        `<circle cx="91" cy="176" r="3" fill="#fff" ${S}/><circle cx="91" cy="196" r="3" fill="#fff" ${S}/>`);
      break;
  }
  return out.join("");
}

function prop(l: Look): string {
  const w = l.build === "broad" ? 104 : l.build === "slim" ? 72 : 82;
  const x = 100 + w / 2 + 10, y = 232; // right hand
  switch (l.prop) {
    case "dumbbell":
      return `<rect x="${x - 22}" y="${y - 4}" width="44" height="8" rx="4" fill="#b9bdc9" ${S}/><rect x="${x - 30}" y="${y - 15}" width="14" height="30" rx="6" fill="#5b6070" ${S}/><rect x="${x + 16}" y="${y - 15}" width="14" height="30" rx="6" fill="#5b6070" ${S}/><circle cx="${x}" cy="${y}" r="10" fill="${l.skin}" ${S}/>`;
    case "tea":
      return `<path d="M${x + 12} ${y - 10} q10 0 10 9 q0 9 -10 9" fill="none" ${S}/><path d="M${x - 14} ${y - 16} h26 v18 q0 12 -13 12 q-13 0 -13 -12Z" fill="#fff" ${S}/><path d="M${x - 14} ${y - 8} h26" stroke="${l.accent}" stroke-width="4"/><path d="M${x - 5} ${y - 24} q-4 -6 0 -12 M${x + 4} ${y - 24} q-4 -6 0 -12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    case "tablet":
      return `<rect x="${x - 14}" y="${y - 30}" width="30" height="40" rx="6" fill="#1b1d2c" ${S}/><path d="M${x - 7} ${y} v-8 M${x} ${y} v-14 M${x + 7} ${y} v-20" stroke="${l.accent}" stroke-width="4" stroke-linecap="round"/><circle cx="${x - 2}" cy="${y + 4}" r="9" fill="${l.skin}" ${S}/>`;
    case "book":
      return `<rect x="${x - 16}" y="${y - 30}" width="30" height="38" rx="5" fill="${l.accent}" ${S}/><path d="M${x - 10} ${y - 22} h18 M${x - 10} ${y - 14} h14" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="${x - 2}" cy="${y + 4}" r="9" fill="${l.skin}" ${S}/>`;
    case "phone":
      return `<rect x="${x - 10}" y="${y - 30}" width="22" height="36" rx="6" fill="#262a40" ${S}/><path d="M${x + 1} ${y - 22} l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2Z" fill="${l.accent}"/><circle cx="${x}" cy="${y + 4}" r="9" fill="${l.skin}" ${S}/>`;
    default:
      return "";
  }
}

export function renderAvatar(seed: string, gender?: string, view: "face" | "full" = "face"): string {
  const l = lookFor(seed, gender);
  const head = `<ellipse cx="50" cy="104" rx="10" ry="11" fill="${l.skin}" ${S}/><ellipse cx="150" cy="104" rx="10" ry="11" fill="${l.skin}" ${S}/><ellipse cx="100" cy="94" rx="52" ry="50" fill="${l.skin}" ${S}/>`;
  const viewBox = view === "full" ? "0 4 200 324" : "30 10 140 140";
  const shadow = view === "full" ? `<ellipse cx="100" cy="316" rx="62" ry="8" fill="#000" opacity=".18"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${shadow}${hairBack(l)}${body(l)}${head}${face(l)}${hairFront(l)}${prop(l)}</svg>`;
}
