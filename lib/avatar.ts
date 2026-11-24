// Original, hand-coded characters in a soft illustrated style:
// tinted (never black) line art, gradient shading lit from the top-left,
// big glossy eyes, blush, stylised long-legged proportions, layered outfits.
// One drawing per character: ?v=full shows the whole figure (browsing),
// ?v=face is the same SVG cropped to the head (chat).

type HairStyle = "buzz" | "quiff" | "swept" | "bob" | "long" | "bun" | "ponytail" | "curly";
type Outfit = "tank" | "tee" | "hoodie" | "blazer" | "tweed" | "cardigan" | "jacket";
type Prop = "dumbbell" | "tea" | "tablet" | "book" | "phone";

export type Look = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  eyes: string;
  outfit: Outfit;
  top: string;
  inner: string;
  bottom: string;
  shoes: string;
  build: "slim" | "normal" | "broad";
  skirt?: boolean;
  glasses?: string;
  earrings?: string;
  beard?: "stubble" | "full";
  old?: boolean;
  brows: "soft" | "stern" | "raised";
  mouth: "smile" | "grin" | "smirk" | "calm";
  prop?: Prop;
  accent: string;
};

const PRESET_LOOKS: Record<string, Look> = {
  "max-gym-1": {
    skin: "#d99a74", hair: "#3b2a24", hairStyle: "buzz", eyes: "#4a3024", outfit: "tank", top: "#4b5163", inner: "#4b5163",
    bottom: "#353a48", shoes: "#e9e6e1", build: "broad", beard: "stubble", brows: "stern", mouth: "calm",
    prop: "dumbbell", accent: "#d8573f",
  },
  "rose-granny-3": {
    skin: "#f1cdb6", hair: "#e9e4ea", hairStyle: "bun", eyes: "#6b4a3a", outfit: "cardigan", top: "#b69ad0", inner: "#f2dfe6",
    bottom: "#d8a7b8", skirt: true, shoes: "#8a5f6e", build: "normal", glasses: "#a87b62", earrings: "#ffffff",
    old: true, brows: "soft", mouth: "smile", prop: "tea", accent: "#e27d8f",
  },
  "victoria-ceo-7": {
    skin: "#eebf9e", hair: "#4a2a1f", hairStyle: "bob", eyes: "#3d2a22", outfit: "blazer", top: "#2f3554", inner: "#f3efe9",
    bottom: "#2f3554", shoes: "#1f2133", build: "slim", earrings: "#e3bd62", brows: "raised", mouth: "smirk",
    prop: "tablet", accent: "#e3bd62",
  },
  "leo-prof-5": {
    skin: "#e5b28d", hair: "#dcdbe2", hairStyle: "swept", eyes: "#4f6a7a", outfit: "tweed", top: "#8c6a4e", inner: "#c9a35b",
    bottom: "#574a3f", shoes: "#4a3328", build: "normal", glasses: "#6b4a3a", beard: "full", old: true,
    brows: "raised", mouth: "smile", prop: "book", accent: "#b8404f",
  },
  "zoe-teen-2": {
    skin: "#efc09c", hair: "#e9708f", hairStyle: "ponytail", eyes: "#5a3a2c", outfit: "hoodie", top: "#a99bf0", inner: "#f4f1fb",
    bottom: "#6f86b3", shoes: "#f5f2ee", build: "slim", earrings: "#d7dbe8", brows: "soft", mouth: "grin",
    prop: "phone", accent: "#7fd6f0",
  },
};

// ------------------------------------------------------------ colour helpers

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, to: [number, number, number], t: number) {
  const c = rgb(hex).map((v, i) => Math.round(v + (to[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
const light = (h: string, t = 0.18) => mix(h, [255, 248, 240], t);
// Darken towards a warm plum instead of black: keeps shadows and lines soft.
const dark = (h: string, t = 0.25) => mix(h, [70, 30, 50], t);

class Paint {
  defs = new Map<string, string>();
  fill(hex: string) {
    const id = "g" + hex.slice(1);
    if (!this.defs.has(id)) {
      this.defs.set(id, `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light(hex, 0.22)}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${dark(hex, 0.16)}"/></linearGradient>`);
    }
    return `fill="url(#${id})" stroke="${dark(hex, 0.42)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  }
  render() {
    return `<defs>${[...this.defs.values()].join("")}<radialGradient id="blush"><stop offset="0" stop-color="#ff7f8f" stop-opacity=".55"/><stop offset="1" stop-color="#ff7f8f" stop-opacity="0"/></radialGradient></defs>`;
  }
}

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

const SKINS = ["#f6d6c2", "#eebf9e", "#dea27c", "#c4865f", "#9a6447", "#704633"];
const NATURAL = ["#3b2a24", "#4a2a1f", "#7a4a2c", "#b0703a", "#dcb26a", "#b9503a"];
const FUN = ["#e9708f", "#7fd6f0", "#a99bf0", "#8fd6b0"];
const EYES = ["#4a3024", "#5a3a2c", "#3f5f6e", "#4f6a3e", "#6b4a3a"];
const CLOTHES = ["#a99bf0", "#8fb8e6", "#ef9fb1", "#93cfb4", "#f0c27f", "#4b5163", "#2f3554", "#e9e4dc", "#c9734f"];
const BOTTOMS = ["#6f86b3", "#353a48", "#574a3f", "#8a9399", "#d9cfc0"];

export function lookFor(seed: string, gender?: string): Look {
  if (PRESET_LOOKS[seed]) return PRESET_LOOKS[seed];
  const r = rng(seed);
  const female = gender === "female";
  const male = gender === "male";
  const hairStyle: HairStyle = female
    ? pick(r, ["bob", "long", "ponytail", "curly", "bun"])
    : male ? pick(r, ["buzz", "quiff", "swept", "curly"])
    : pick(r, ["quiff", "bob", "curly", "ponytail", "buzz"]);
  return {
    skin: pick(r, SKINS),
    hair: male || female ? pick(r, [...NATURAL, ...NATURAL, pick(r, FUN)]) : pick(r, [...NATURAL, ...FUN]),
    hairStyle,
    eyes: pick(r, EYES),
    outfit: pick(r, female ? ["tee", "hoodie", "blazer", "cardigan", "jacket"] : ["tee", "hoodie", "blazer", "jacket", "tank"]),
    top: pick(r, CLOTHES),
    inner: pick(r, ["#f4f1fb", "#f6e7b0", "#d8eef7", "#efe2d6"]),
    bottom: pick(r, BOTTOMS),
    skirt: female && r() < 0.35,
    shoes: pick(r, ["#2a2b36", "#f5f2ee", "#8a5f6e", "#c9734f"]),
    build: male ? pick(r, ["normal", "broad"]) : pick(r, ["slim", "normal"]),
    glasses: r() < 0.25 ? pick(r, ["#6b4a3a", "#3b2a24", "#b8404f"]) : undefined,
    earrings: !male && r() < 0.5 ? pick(r, ["#e3bd62", "#d7dbe8"]) : undefined,
    beard: male && r() < 0.25 ? pick(r, ["stubble", "full"]) : undefined,
    brows: pick(r, ["soft", "soft", "raised", "stern"]),
    mouth: pick(r, ["smile", "smile", "grin", "smirk"]),
    accent: pick(r, ["#ef9fb1", "#7fd6f0", "#e3bd62", "#d8573f"]),
  };
}

// ------------------------------------------------------------ geometry
// Canvas 200 x 360. Head centre ~ (100, 76). Shoulders y=130, waist y=205,
// legs to y=336, feet ~ y=350.

const W = { slim: 60, normal: 68, broad: 88 } as const;

function hairBack(l: Look, p: Paint): string {
  const f = p.fill(l.hair);
  switch (l.hairStyle) {
    case "bob": return `<path d="M60 78 Q56 30 100 30 Q144 30 140 78 L142 112 Q142 120 134 120 Q120 122 116 112 L84 112 Q80 122 66 120 Q58 120 58 112Z" ${f}/>`;
    case "long": return `<path d="M60 76 Q56 28 100 28 Q144 28 140 76 L146 168 Q148 180 136 180 Q124 180 122 168 L78 168 Q76 180 64 180 Q52 180 54 168Z" ${f}/>`;
    case "bun": return `<circle cx="100" cy="30" r="15" ${f}/><path d="M92 26 Q100 20 108 26" fill="none" stroke="${dark(l.hair, 0.3)}" stroke-width="1.6"/>`;
    case "ponytail": return `<path d="M126 44 Q170 46 162 104 Q158 124 146 120 Q138 116 144 100 Q152 72 124 60Z" ${f}/><path d="M150 66 Q156 86 148 104" fill="none" stroke="${light(l.hair, 0.4)}" stroke-width="2"/><ellipse cx="130" cy="50" rx="6" ry="7" ${p.fill(l.accent)}/>`;
    case "curly": return Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (0.92 + i * 0.145);
      return `<circle cx="${100 + 42 * Math.cos(a)}" cy="${78 + 44 * Math.sin(a)}" r="13" ${f}/>`;
    }).join("") + `<circle cx="62" cy="96" r="12" ${f}/><circle cx="138" cy="96" r="12" ${f}/>`;
    default: return "";
  }
}

function hairFront(l: Look, p: Paint): string {
  const f = p.fill(l.hair);
  const shine = (d: string) => `<path d="${d}" fill="none" stroke="${light(l.hair, 0.45)}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
  const strand = (d: string) => `<path d="${d}" fill="none" stroke="${dark(l.hair, 0.3)}" stroke-width="1.4" stroke-linecap="round"/>`;
  switch (l.hairStyle) {
    case "buzz":
      return `<path d="M66 74 Q64 36 100 36 Q136 36 134 74 Q130 56 100 54 Q70 56 66 74Z" ${f}/>`;
    case "quiff":
      return `<path d="M64 80 Q58 40 92 30 Q112 22 132 34 Q146 46 136 80 Q134 62 124 56 Q112 50 98 56 Q84 50 74 58 Q66 66 64 80Z" ${f}/>` +
        shine("M90 36 Q108 30 124 40") + strand("M100 34 Q112 44 118 56");
    case "swept":
      return `<path d="M64 82 Q58 36 102 34 Q142 36 136 82 Q134 60 122 52 Q100 62 78 50 Q68 62 64 82Z" ${f}/>` +
        shine("M84 42 Q100 38 118 44") + strand("M78 50 Q96 56 110 52");
    case "bob":
      return `<path d="M64 78 Q62 34 100 34 Q138 34 136 78 Q132 64 124 66 Q118 54 108 62 Q100 50 92 62 Q82 54 76 66 Q68 64 64 78Z" ${f}/>` +
        shine("M78 42 Q100 34 122 42");
    case "long":
      return `<path d="M64 82 Q60 32 100 32 Q140 32 136 82 Q130 52 108 48 Q96 62 72 64 Q66 70 64 82Z" ${f}/>` +
        shine("M80 40 Q98 34 118 40") + strand("M108 48 Q118 60 126 76");
    case "bun":
      return `<path d="M66 80 Q64 38 100 38 Q136 38 134 80 Q128 54 100 52 Q72 54 66 80Z" ${f}/>` +
        strand("M100 40 Q96 50 100 54") + shine("M80 46 Q100 40 120 46");
    case "ponytail":
      return `<path d="M64 80 Q60 34 100 34 Q140 34 136 80 Q130 58 112 54 Q102 70 80 68 Q68 68 64 80Z" ${f}/>` +
        shine("M80 42 Q98 36 116 42") + strand("M112 54 Q110 64 104 68");
    case "curly":
      return [0, 1, 2, 3, 4].map((i) => `<circle cx="${70 + i * 15}" cy="${48 - Math.sin((i / 4) * Math.PI) * 8}" r="12" ${f}/>`).join("");
  }
}

function face(l: Look, p: Paint): string {
  const parts: string[] = [];
  // blush
  parts.push(`<ellipse cx="80" cy="96" rx="10" ry="6" fill="url(#blush)"/><ellipse cx="120" cy="96" rx="10" ry="6" fill="url(#blush)"/>`);
  // eyes: big glossy irises, lids
  const lid = dark(l.skin, 0.62);
  for (const x of [87, 113]) {
    const lidY = l.brows === "stern" ? 77 : 75;
    parts.push(
      `<ellipse cx="${x}" cy="82" rx="7.5" ry="8.5" fill="#fffaf6"/>`,
      `<circle cx="${x}" cy="83" r="6.4" fill="${l.eyes}"/>`,
      `<circle cx="${x}" cy="84" r="3.2" fill="${dark(l.eyes, 0.6)}"/>`,
      `<circle cx="${x - 2.2}" cy="80.4" r="2.3" fill="#fff"/><circle cx="${x + 2.4}" cy="86" r="1.1" fill="#fff" opacity=".9"/>`,
      `<path d="M${x - 9} ${lidY + 5} Q${x} ${lidY - 3} ${x + 9} ${lidY + 5}" fill="none" stroke="${lid}" stroke-width="2.6" stroke-linecap="round"/>`,
      l.brows === "stern" ? `<path d="M${x - 8} 80 Q${x} 76 ${x + 8} 80 L${x + 8} 73 L${x - 8} 73Z" fill="${l.skin}"/>` : "",
    );
  }
  // brows
  const bc = dark(l.hair === "#e9e4ea" || l.hair === "#dcdbe2" ? "#9a8f99" : l.hair, 0.15);
  const brow = {
    soft: `<path d="M80 68 Q87 65 94 68 M106 68 Q113 65 120 68" fill="none" stroke="${bc}" stroke-width="2.4" stroke-linecap="round"/>`,
    stern: `<path d="M79 66 Q87 67 95 71 M105 71 Q113 67 121 66" fill="none" stroke="${bc}" stroke-width="3.6" stroke-linecap="round"/>`,
    raised: `<path d="M80 66 Q87 61 94 65 M106 65 Q113 61 120 66" fill="none" stroke="${bc}" stroke-width="2.4" stroke-linecap="round"/>`,
  }[l.brows];
  parts.push(brow);
  // nose: soft, with a highlight
  parts.push(`<path d="M99 92 Q103 95 99 97" fill="none" stroke="${dark(l.skin, 0.32)}" stroke-width="1.8" stroke-linecap="round"/><circle cx="101" cy="92" r="1.2" fill="#fff" opacity=".6"/>`);
  // wrinkles
  if (l.old) parts.push(`<path d="M76 84 l-4 -1 M76 88 l-4 1.5 M124 84 l4 -1 M124 88 l4 1.5 M91 104 q-3 3 -2 6 M109 104 q3 3 2 6" fill="none" stroke="${dark(l.skin, 0.28)}" stroke-width="1.3" stroke-linecap="round"/>`);
  // mouth
  const mc = dark(l.skin, 0.55);
  const mouth = {
    smile: `<path d="M94 103 Q100 108 106 103" fill="none" stroke="${mc}" stroke-width="2" stroke-linecap="round"/>`,
    grin: `<path d="M93 102 Q100 103 107 102 Q105 110 100 110 Q95 110 93 102Z" fill="#8c3b4c" stroke="${mc}" stroke-width="1.6" stroke-linejoin="round"/><path d="M96 107 Q100 109 104 107" fill="none" stroke="#f28f9e" stroke-width="2" stroke-linecap="round"/>`,
    smirk: `<path d="M95 105 Q102 107 107 102" fill="none" stroke="${mc}" stroke-width="2" stroke-linecap="round"/>`,
    calm: `<path d="M95 105 Q100 106 105 105" fill="none" stroke="${mc}" stroke-width="2" stroke-linecap="round"/>`,
  }[l.mouth];
  if (l.beard === "full") {
    parts.push(`<path d="M68 90 Q70 124 100 128 Q130 124 132 90 Q126 104 114 104 Q100 98 86 104 Q74 104 68 90Z" ${p.fill(l.hair)}/>`, mouth,
      `<path d="M86 101 Q100 95 114 101" fill="none" stroke="${dark(l.hair, 0.2)}" stroke-width="3" stroke-linecap="round"/>`);
  } else {
    parts.push(mouth);
    if (l.beard === "stubble") parts.push(`<path d="M72 94 Q76 112 100 116 Q124 112 128 94 Q120 106 100 108 Q80 106 72 94Z" fill="${l.hair}" opacity=".12"/>`);
  }
  if (l.glasses) {
    const g = l.glasses;
    parts.push(`<circle cx="87" cy="83" r="11.5" fill="#fff" fill-opacity=".12" stroke="${g}" stroke-width="2.2"/><circle cx="113" cy="83" r="11.5" fill="#fff" fill-opacity=".12" stroke="${g}" stroke-width="2.2"/><path d="M98.5 82 Q100 79.5 101.5 82 M75.5 81 L66 78 M124.5 81 L134 78" fill="none" stroke="${g}" stroke-width="2.2" stroke-linecap="round"/><path d="M80 78 l4 -3 M106 78 l4 -3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);
  }
  if (l.earrings) parts.push(`<circle cx="65" cy="96" r="3.4" fill="${l.earrings}" stroke="${dark(l.earrings, 0.4)}" stroke-width="1.2"/><circle cx="135" cy="96" r="3.4" fill="${l.earrings}" stroke="${dark(l.earrings, 0.4)}" stroke-width="1.2"/>`);
  return parts.join("");
}

function head(l: Look, p: Paint): string {
  const sf = p.fill(l.skin);
  const inner = dark(l.skin, 0.2);
  return `<ellipse cx="65" cy="84" rx="7" ry="9" ${sf}/><path d="M66 80 q-3 4 0 8" fill="none" stroke="${inner}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<ellipse cx="135" cy="84" rx="7" ry="9" ${sf}/><path d="M134 80 q3 4 0 8" fill="none" stroke="${inner}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M66 74 Q66 38 100 38 Q134 38 134 74 Q134 100 118 112 Q100 122 82 112 Q66 100 66 74Z" ${sf}/>`;
}

function figure(l: Look, p: Paint): string {
  const w = W[l.build];
  const xl = 100 - w / 2, xr = 100 + w / 2;
  const waist = w * 0.4;
  const out: string[] = [];
  const skin = p.fill(l.skin);
  const longSleeve = ["hoodie", "blazer", "tweed", "cardigan", "jacket"].includes(l.outfit);
  const armW = l.build === "broad" ? 20 : 14;
  const handR = l.build === "broad" ? 8 : 6.5;

  // legs (or skirt) + shoes
  if (l.skirt) {
    out.push(`<path d="M90 270 L89 336 M110 270 L111 336" fill="none" stroke="${dark(l.skin, 0.42)}" stroke-width="13" stroke-linecap="round"/><path d="M90 270 L89 336 M110 270 L111 336" fill="none" stroke="${l.skin}" stroke-width="10" stroke-linecap="round"/>`);
  } else {
    const baggy = l.outfit === "hoodie" || l.outfit === "jacket";
    const lw = baggy ? 24 : l.build === "broad" ? 24 : 19;
    for (const side of [-1, 1]) {
      const cx = 100 + side * (lw / 2 + 1);
      out.push(`<path d="M${cx - lw / 2} 212 L${cx - lw / 2 + (baggy ? -2 : 2)} 336 Q${cx} 340 ${cx + lw / 2 + (baggy ? 2 : -2)} 336 L${cx + lw / 2} 212Z" ${p.fill(l.bottom)}/>`);
      if (baggy) out.push(`<path d="M${cx - lw / 2 - 2} 326 Q${cx} 331 ${cx + lw / 2 + 2} 326" fill="none" stroke="${dark(l.bottom, 0.3)}" stroke-width="1.6"/>`);
      out.push(`<path d="M${cx + side * 2} 230 Q${cx + side * 4} 290 ${cx} 320" fill="none" stroke="${dark(l.bottom, 0.25)}" stroke-width="1.3" opacity=".7"/>`);
    }
  }
  for (const side of [-1, 1]) {
    const cx = 100 + side * 13;
    const chunky = l.shoes === "#f5f2ee" || l.shoes === "#e9e6e1";
    out.push(`<path d="M${cx - 11} 348 Q${cx - 12} 334 ${cx} 334 Q${cx + 10 + side * 4} 336 ${cx + 12 + side * 4} 346 Q${cx + 12 + side * 4} 352 ${cx} 352 L${cx - 8} 352 Q${cx - 11} 352 ${cx - 11} 348Z" ${p.fill(l.shoes)}/>`);
    if (chunky) out.push(`<path d="M${cx - 11} 348 L${cx + 12 + side * 4} 348" stroke="${dark(l.shoes, 0.35)}" stroke-width="1.6"/><path d="M${cx - 4} 339 l5 2 M${cx - 5} 343 l5 2" stroke="${l.accent}" stroke-width="1.6" stroke-linecap="round"/>`);
  }

  // arms behind torso
  for (const side of [-1, 1] as const) {
    const sx = side < 0 ? xl + 7 : xr - 7;
    const hx = sx + side * (l.build === "broad" ? 16 : 11);
    const d = `M${sx} 140 Q${sx + side * 12} 182 ${hx} 222`;
    const col = longSleeve ? (l.outfit === "cardigan" ? l.top : l.top) : l.skin;
    out.push(`<path d="${d}" fill="none" stroke="${dark(col, 0.42)}" stroke-width="${armW + 4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${armW}" stroke-linecap="round"/>`,
      `<path d="M${sx - side * 2} 146 Q${sx + side * 8} 180 ${hx - side * 3} 214" fill="none" stroke="${light(col, 0.3)}" stroke-width="${armW * 0.25}" stroke-linecap="round" opacity=".55"/>`);
    if (l.outfit === "tee") out.push(`<path d="M${sx} 140 Q${sx + side * 5} 156 ${sx + side * 7} 164" fill="none" stroke="${dark(l.top, 0.42)}" stroke-width="${armW + 6}" stroke-linecap="round"/><path d="M${sx} 140 Q${sx + side * 5} 156 ${sx + side * 7} 164" fill="none" stroke="${l.top}" stroke-width="${armW + 2}" stroke-linecap="round"/>`);
    if (l.build === "broad") out.push(`<path d="M${sx + side * 6} 156 Q${sx + side * 16} 164 ${sx + side * 10} 176" fill="none" stroke="${dark(l.skin, 0.22)}" stroke-width="1.6" stroke-linecap="round"/>`);
    out.push(`<circle cx="${hx}" cy="226" r="${handR}" ${skin}/>`);
  }

  // neck with chin shadow
  out.push(`<path d="M92 104 L92 134 Q100 138 108 134 L108 104Z" ${skin}/><path d="M92 112 Q100 120 108 112 L108 118 Q100 124 92 118Z" fill="${dark(l.skin, 0.2)}" opacity=".6"/>`);

  // skirt / dress under torso
  if (l.skirt) out.push(`<path d="M${100 - waist} 200 Q${xl - 16} 270 ${xl - 18} 282 Q100 294 ${xr + 18} 282 Q${xr + 16} 270 ${100 + waist} 200Z" ${p.fill(l.bottom)}/><path d="M${100 - 10} 220 Q${xl - 6} 262 ${xl - 4} 284 M${100 + 10} 220 Q${xr + 6} 262 ${xr + 4} 284" fill="none" stroke="${dark(l.bottom, 0.22)}" stroke-width="1.4"/>`);

  // hood behind neck
  if (l.outfit === "hoodie") out.push(`<path d="M78 128 Q100 112 122 128 Q114 142 100 142 Q86 142 78 128Z" ${p.fill(dark(l.top, 0.08))}/>`);

  // torso: shoulders -> waist, slight taper
  const hem = l.outfit === "hoodie" || l.outfit === "jacket" ? 226 : l.skirt ? 206 : 216;
  const hw = l.outfit === "hoodie" || l.outfit === "jacket" ? w * 0.48 : waist + 2;
  const torsoCol = l.outfit === "cardigan" ? l.inner : l.outfit === "tweed" ? l.inner : l.outfit === "jacket" ? l.inner : l.top;
  out.push(`<path d="M${xl + 6} 130 Q100 124 ${xr - 6} 130 Q${xr + 2} 134 ${xr} 150 Q${100 + w * 0.42} 186 ${100 + hw} ${hem} Q100 ${hem + 4} ${100 - hw} ${hem} Q${100 - w * 0.42} 186 ${xl} 150 Q${xl - 2} 134 ${xl + 6} 130Z" ${p.fill(torsoCol)}/>`);

  const fold = (d: string, c: string) => `<path d="${d}" fill="none" stroke="${dark(c, 0.28)}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
  switch (l.outfit) {
    case "tank":
      out.push(`<path d="M${xl + 14} 131 Q100 156 ${xr - 14} 131 Q100 140 ${xl + 14} 131Z" ${skin}/>`, fold(`M${100 - 14} 180 Q100 186 ${100 + 14} 180`, l.top));
      break;
    case "tee":
      out.push(`<path d="M91 130 Q100 140 109 130" fill="none" stroke="${dark(l.top, 0.4)}" stroke-width="2"/>`, fold(`M${100 - 16} 176 Q100 182 ${100 + 14} 172`, l.top));
      break;
    case "hoodie":
      out.push(`<path d="M94 138 L93 160 M106 138 L107 160" stroke="${l.inner}" stroke-width="2" stroke-linecap="round"/><circle cx="93" cy="162" r="2" fill="${l.inner}"/><circle cx="107" cy="162" r="2" fill="${l.inner}"/>`,
        `<path d="M${100 - 20} 192 L${100 + 20} 192 L${100 + 24} 214 L${100 - 24} 214Z" ${p.fill(dark(l.top, 0.06))}/>`,
        `<path d="M${100 - hw + 2} 218 L${100 + hw - 2} 218" stroke="${dark(l.top, 0.3)}" stroke-width="1.6"/>`);
      break;
    case "jacket": {
      // open oversized jacket over a light top
      for (const side of [-1, 1]) {
        const ox = side < 0 ? xl : xr;
        out.push(`<path d="M${100 + side * 8} 128 Q${100 + side * 14} 170 ${100 + side * 12} ${hem + 2} L${ox + side * 6} ${hem + 2} Q${ox + side * 6} 170 ${ox} 136 Q${ox - side * 2} 128 ${100 + side * 8} 128Z" ${p.fill(l.top)}/>`,
          `<path d="M${100 + side * 8} 128 L${100 + side * 18} 150 L${100 + side * 12} 156" fill="none" stroke="${dark(l.top, 0.35)}" stroke-width="1.6"/>`,
          `<rect x="${100 + side * 24 - 7}" y="170" width="14" height="10" rx="3" fill="none" stroke="${dark(l.top, 0.35)}" stroke-width="1.4"/>`);
      }
      break;
    }
    case "blazer":
    case "tweed": {
      for (const side of [-1, 1]) {
        const ox = side < 0 ? xl : xr;
        out.push(`<path d="M${100 + side * 3} ${l.outfit === "blazer" ? 170 : 176} L${100 + side * 10} 128 Q${ox - side * 2} 128 ${ox} 140 Q${ox + side * 1} 176 ${100 + side * waist + side * 4} ${hem} L${100 + side * 2} ${hem}Z" ${p.fill(l.top)}/>`,
          `<path d="M${100 + side * 10} 128 L${100 + side * 20} 152 L${100 + side * 12} 158 L${100 + side * 3} ${l.outfit === "blazer" ? 170 : 176}" fill="${dark(l.top, 0.1)}" stroke="${dark(l.top, 0.42)}" stroke-width="1.6" stroke-linejoin="round"/>`);
      }
      if (l.outfit === "tweed") {
        // knit vest and bow tie
        out.push(`<path d="M93 136 L100 176 L107 136" fill="none" stroke="${dark(l.inner, 0.3)}" stroke-width="1.4"/>`,
          `<path d="M100 134 L92 129 L92 139Z M100 134 L108 129 L108 139Z" ${p.fill(l.accent)}/><circle cx="100" cy="134" r="2.4" fill="${dark(l.accent, 0.2)}"/>`,
          `<path d="M${100 - 14} 196 l8 0 M${100 + 6} 196 l8 0" stroke="${dark(l.top, 0.4)}" stroke-width="1.4"/>`);
      } else {
        out.push(`<path d="M94 132 Q100 146 106 132" fill="none" stroke="${l.accent}" stroke-width="1.6"/><circle cx="100" cy="145" r="2.6" fill="${l.accent}" stroke="${dark(l.accent, 0.4)}" stroke-width="1"/>`);
      }
      out.push(`<circle cx="100" cy="190" r="2.4" fill="${dark(l.top, 0.4)}"/>`);
      break;
    }
    case "cardigan": {
      for (const side of [-1, 1]) {
        const ox = side < 0 ? xl : xr;
        out.push(`<path d="M${100 + side * 6} 128 Q${100 + side * 10} 168 ${100 + side * 8} ${hem + 4} L${ox + side * 4} ${hem + 4} Q${ox + side * 4} 168 ${ox} 138 Q${ox - side * 2} 128 ${100 + side * 6} 128Z" ${p.fill(l.top)}/>`,
          `<path d="M${100 + side * 14} 150 l0 0" stroke="#fff"/>`);
      }
      out.push(`<circle cx="93" cy="156" r="2.2" fill="#fff" stroke="${dark(l.top, 0.4)}" stroke-width="1"/><circle cx="93" cy="176" r="2.2" fill="#fff" stroke="${dark(l.top, 0.4)}" stroke-width="1"/>`,
        `<path d="M${xl + 6} ${hem} L${100 - 8} ${hem} M${100 + 8} ${hem} L${xr - 6} ${hem}" stroke="${dark(l.top, 0.3)}" stroke-width="1.4"/>`);
      break;
    }
  }
  return out.join("");
}

function prop(l: Look, p: Paint): string {
  const x = 100 + W[l.build] / 2 - 7 + (l.build === "broad" ? 16 : 11);
  const y = 226;
  const hand = `<circle cx="${x}" cy="${y + 2}" r="${l.build === "broad" ? 8 : 6.5}" ${p.fill(l.skin)}/>`;
  switch (l.prop) {
    case "dumbbell":
      return `<rect x="${x - 17}" y="${y - 3}" width="34" height="6" rx="3" ${p.fill("#c3c7d1")}/><rect x="${x - 24}" y="${y - 12}" width="11" height="24" rx="4" ${p.fill("#5b6070")}/><rect x="${x + 13}" y="${y - 12}" width="11" height="24" rx="4" ${p.fill("#5b6070")}/>${hand}`;
    case "tea":
      return `<path d="M${x + 9} ${y - 8} q8 0 8 7 q0 7 -8 7" fill="none" stroke="${dark("#ffffff", 0.4)}" stroke-width="2"/><path d="M${x - 10} ${y - 12} h20 v13 q0 10 -10 10 q-10 0 -10 -10Z" ${p.fill("#fbf6f2")}/><path d="M${x - 10} ${y - 5} h20" stroke="${l.accent}" stroke-width="3"/><path d="M${x - 4} ${y - 18} q-3 -5 0 -10 M${x + 3} ${y - 18} q-3 -5 0 -10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/>`;
    case "tablet":
      return `<rect x="${x - 11}" y="${y - 24}" width="24" height="32" rx="4" ${p.fill("#23263a")}/><path d="M${x - 5} ${y} v-6 M${x + 1} ${y} v-11 M${x + 7} ${y} v-16" stroke="${l.accent}" stroke-width="3" stroke-linecap="round"/>${hand}`;
    case "book":
      return `<rect x="${x - 12}" y="${y - 24}" width="24" height="30" rx="3" ${p.fill(l.accent)}/><path d="M${x - 7} ${y - 17} h14 M${x - 7} ${y - 11} h10" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>${hand}`;
    case "phone":
      return `<rect x="${x - 8}" y="${y - 24}" width="17" height="28" rx="4" ${p.fill("#2b2f46")}/><path d="M${x + 0.5} ${y - 17} l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6Z" fill="${l.accent}"/>${hand}`;
    default:
      return "";
  }
}

export function renderAvatar(seed: string, gender?: string, view: "face" | "full" = "face"): string {
  const l = lookFor(seed, gender);
  const p = new Paint();
  // Long hair falls behind the body; buns and ponytails sit in front of the shoulders.
  const backFirst = l.hairStyle === "long" || l.hairStyle === "curly" || l.hairStyle === "bob";
  const rest = head(l, p) + face(l, p) + hairFront(l, p) + prop(l, p);
  const content = backFirst ? hairBack(l, p) + figure(l, p) + rest : figure(l, p) + hairBack(l, p) + rest;
  const viewBox = view === "full" ? "10 12 180 350" : "44 14 112 112";
  const shadow = view === "full" ? `<ellipse cx="100" cy="354" rx="44" ry="6" fill="#2a1f33" opacity=".18"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${p.render()}${shadow}${content}</svg>`;
}
