// Avatar look = deterministic function of (seed, gender) via DiceBear's
// "adventurer" style. Gender narrows hairstyles; presets can pin details.
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";

const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`);
const LONG = range("long", 26);
const SHORT = range("short", 19);
const NATURAL_HAIR = ["ac6511", "cb6820", "ab2a18", "e5d7a3", "b9a05f", "796a45", "6a4e35", "562306", "0e0e0e"];
const FUN_HAIR = ["3eac2c", "85c2c6", "dba3be", "592454"];

// Small hand-tuned overrides so presets look like their descriptions.
const PRESET_LOOKS: Record<string, Record<string, unknown>> = {
  "max-gym-1": { hair: ["short04"], hairColor: ["0e0e0e"], skinColor: ["ecad80"], glassesProbability: 0, earringsProbability: 0, eyes: ["variant12"], eyebrows: ["variant01"], mouth: ["variant04"] },
  "rose-granny-3": { hair: ["long16"], hairColor: ["afafaf"], skinColor: ["f2d3b1"], glassesProbability: 100, glasses: ["variant02"], earringsProbability: 100, mouth: ["variant01"], eyes: ["variant02"] },
  "victoria-ceo-7": { hair: ["long05"], hairColor: ["562306"], skinColor: ["f2d3b1"], glassesProbability: 0, earringsProbability: 100, eyes: ["variant03"], mouth: ["variant29"] },
  "leo-prof-5": { hair: ["short06"], hairColor: ["afafaf"], skinColor: ["ecad80"], glassesProbability: 100, glasses: ["variant03"], earringsProbability: 0, mouth: ["variant01"], eyes: ["variant01"] },
  "zoe-teen-2": { hair: ["long20"], hairColor: ["dba3be"], skinColor: ["ecad80"], glassesProbability: 0, earringsProbability: 100 },
};

export function renderAvatar(seed: string, gender?: string): string {
  const byGender =
    gender === "female" ? { hair: LONG, hairColor: NATURAL_HAIR }
    : gender === "male" ? { hair: SHORT, hairColor: NATURAL_HAIR, earringsProbability: 0 }
    : { hairColor: [...NATURAL_HAIR, ...FUN_HAIR] };
  return createAvatar(adventurer, {
    seed,
    glassesProbability: 8,
    backgroundColor: ["c7b8ff", "ffd6a5", "b9fbc0", "a0c4ff", "ffc6e2", "fdffb6"],
    backgroundType: ["gradientLinear"],
    ...byGender,
    ...(PRESET_LOOKS[seed] ?? {}),
  } as any).toString();
}
