"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Sparkle } from "@/components/Sparkle";
import { GENDERS, TONES, TRAITS, type Gender } from "@/lib/personas";

const MAX_TRAITS = 3;
const INITIAL_SEEDS = ["nova", "ash", "rio", "maple", "zen", "ivy", "jules", "orion"];
const MAX_SIDE = 768; // px, longest side after resizing

/** Resize an uploaded picture in the browser so only a small JPEG is stored. */
async function toSmallJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f2e6da"; // background for transparent PNGs
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

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
  const [lookMode, setLookMode] = useState<"draw" | "upload">("draw");
  const [image, setImage] = useState<string | null>(null);
  const [faceZoom, setFaceZoom] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const chosenSeed = avatarSeed || seeds[0];
  const canSave = name.trim() && traits.length > 0 && !saving && (lookMode === "draw" || !!image);

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
      body: JSON.stringify({ name, gender, traits, tone, tagline, backstory, avatarSeed: chosenSeed, image: lookMode === "upload" ? image : null, faceZoom }),
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
        <div className="screen-title">New character</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="field">
        <span className="label">Look</span>
        <div className="segmented" style={{ marginBottom: 12 }}>
          <button className={lookMode === "draw" ? "on" : ""} onClick={() => setLookMode("draw")}>Draw for me</button>
          <button className={lookMode === "upload" ? "on" : ""} onClick={() => setLookMode("upload")}>My own picture</button>
        </div>

        {lookMode === "draw" ? (
          <>
            <div className="avatar-picker">
              {seeds.map((s) => (
                <button key={s} className={s === chosenSeed ? "on" : ""} onClick={() => setAvatarSeed(s)} aria-label="Choose look">
                  <Avatar seed={s} gender={gender} view="full" />
                </button>
              ))}
            </div>
            <button className="btn btn-small" style={{ marginTop: 10 }} onClick={() => { setSeeds(randomSeeds()); setAvatarSeed(""); }}>
              <Sparkle size={12} /> Shuffle looks
            </button>
          </>
        ) : (
          <div className="upload-tile">
            <button className="upload-preview" onClick={() => fileRef.current?.click()} aria-label="Choose picture" style={{ border: 0 }}>
              {image ? <img src={image} alt="" /> : <span>Tap to choose<br />a picture</span>}
            </button>
            <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
              {image && (
                <>
                  <Avatar seed="" image={image} faceZoom={faceZoom} size={64} />
                  <label className="hint" style={{ width: "100%" }}>
                    Zoom into the face
                    <input className="zoom" type="range" min={1} max={3} step={0.1} value={faceZoom} onChange={(e) => setFaceZoom(Number(e.target.value))} />
                  </label>
                </>
              )}
              <button className="btn btn-small" onClick={() => fileRef.current?.click()}>
                <Sparkle size={12} /> {image ? "Change picture" : "Upload picture"}
              </button>
              <span className="hint">A drawing or illustration works best. Use the slider to frame the face for chat. Only you can see it.</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setImage(await toSmallJpeg(file));
                  setError("");
                } catch {
                  setError("Couldn't read that picture. Try a JPG or PNG.");
                }
              }}
            />
          </div>
        )}
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
          {lookMode === "upload" && image ? <Avatar seed="" image={image} faceZoom={faceZoom} size={28} /> : <Avatar seed={chosenSeed} gender={gender} size={28} />}
          {saving ? "Creating…" : name.trim() ? `Start chatting with ${name.trim()}` : "Create character"}
        </button>
      </div>
    </main>
  );
}
