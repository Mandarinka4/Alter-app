"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { GENDERS, TONES, TRAITS, type Gender } from "@/lib/personas";

const MAX_TRAITS = 3;
const INITIAL_SEEDS = ["nova", "ash", "rio", "maple", "zen", "ivy", "jules", "orion"];
const randomSeeds = () => Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 9));

export default function CreatePage() {
  const router = useRouter();
  const [seeds, setSeeds] = useState<string[]>(INITIAL_SEEDS);
  // Randomise after mount (not during render) to avoid a hydration mismatch.
  useEffect(() => setSeeds(randomSeeds()), []);
  const [avatarSeed, setAvatarSeed] = useState<string>("");
  const [gender, setGender] = useState<Gender>("female");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [tone, setTone] = useState("warm");
  const [tagline, setTagline] = useState("");
  const [backstory, setBackstory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const chosenSeed = avatarSeed || seeds[0];
  const canSave = name.trim() && traits.length > 0 && !saving;

  const toggleTrait = (id: string) =>
    setTraits((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < MAX_TRAITS ? [...t, id] : t));

  const taglinePlaceholder = useMemo(() => {
    const first = TRAITS.find((t) => t.id === traits[0]);
    return first ? `e.g. ${first.label} barista who knows everyone's order` : "e.g. Barista who knows everyone's order";
  }, [traits]);

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gender, traits, tone, tagline, backstory, avatarSeed: chosenSeed }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Couldn't save. Try again.");
      setSaving(false);
      return;
    }
    router.replace(`/c/${data.id}`);
  }

  return (
    <main className="page">
      <div className="brand">
        <Link href="/" className="icon-btn" aria-label="Back">←</Link>
        <div style={{ fontWeight: 700 }}>New character</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="field">
        <span className="label">Look <span className="hint">· tap to choose</span></span>
        <div className="avatar-picker">
          {seeds.map((s) => (
            <button key={s} className={s === chosenSeed ? "on" : ""} onClick={() => setAvatarSeed(s)} aria-label="Choose avatar">
              <Avatar seed={s} gender={gender} />
            </button>
          ))}
        </div>
        <button className="btn btn-small" style={{ marginTop: 10 }} onClick={() => { setSeeds(randomSeeds()); setAvatarSeed(""); }}>
          🎲 Shuffle looks
        </button>
      </div>

      <div className="field">
        <span className="label">Gender</span>
        <div className="segmented">
          {GENDERS.map((g) => (
            <button key={g.id} className={gender === g.id ? "on" : ""} onClick={() => setGender(g.id)}>{g.label}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="name">Name</label>
        <input id="name" className="text-input" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova" autoComplete="off" />
      </div>

      <div className="field">
        <span className="label">Personality <span className="hint">· pick up to {MAX_TRAITS}</span></span>
        <div className="pick-chips">
          {TRAITS.map((t) => (
            <button
              key={t.id}
              className={`pick ${traits.includes(t.id) ? "on" : ""}`}
              disabled={!traits.includes(t.id) && traits.length >= MAX_TRAITS}
              onClick={() => toggleTrait(t.id)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">Tone of voice</span>
        <div className="tone-list">
          {TONES.map((t) => (
            <button key={t.id} className={`tone ${tone === t.id ? "on" : ""}`} onClick={() => setTone(t.id)}>
              <div style={{ fontWeight: 650 }}>{t.label}</div>
              <div className="ex">“{t.example}”</div>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="tagline">One-line description <span className="hint">· optional</span></label>
        <input id="tagline" className="text-input" maxLength={90} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={taglinePlaceholder} />
      </div>

      <div className="field">
        <label className="label" htmlFor="backstory">Backstory <span className="hint">· optional, makes them feel real</span></label>
        <textarea id="backstory" className="text-input" maxLength={600} value={backstory} onChange={(e) => setBackstory(e.target.value)}
          placeholder="Where do they live, what do they do, what do they care about?" />
      </div>

      <div className="sticky-cta">
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} disabled={!canSave} onClick={save}>
          <Avatar seed={chosenSeed} gender={gender} size={28} />
          {saving ? "Creating…" : name.trim() ? `Start chatting with ${name.trim()}` : "Create character"}
        </button>
      </div>
    </main>
  );
}
