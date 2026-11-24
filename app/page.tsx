"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CharacterPic } from "@/components/Avatar";
import { Sparkle } from "@/components/Sparkle";
import { TRAITS, type Character } from "@/lib/personas";
import { shortTime } from "@/lib/time";

type Home = {
  presets: Character[];
  own: Character[];
  chats: { character: Character; lastMessage: { role: string; content: string; at: string } }[];
};

export default function HomePage() {
  const [data, setData] = useState<Home | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError("Couldn't load. Pull to refresh."));
  }, []);

  const chattedIds = new Set(data?.chats.map((c) => c.character.id));
  const newOwn = data?.own.filter((c) => !chattedIds.has(c.id)) ?? [];

  return (
    <main className="page">
      <div className="brand">
        <div className="logo"><span className="chrome-text">Alter</span><Sparkle size={18} className="twinkle" /></div>
        <Link href="/create" className="btn btn-primary btn-small"><Sparkle size={12} /> Create</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!data && !error && <div className="center">Loading…</div>}

      {data && data.chats.length > 0 && (
        <>
          <div className="section-title"><Sparkle size={10} /> Your chats</div>
          {data.chats.map(({ character: c, lastMessage: m }) => (
            <Link key={c.id} href={`/c/${c.id}`} className="chat-row">
              <CharacterPic c={c} size={52} />
              <div className="meta">
                <div className="name">{c.name}<span className="time">{shortTime(m.at)}</span></div>
                <div className="preview">{m.role === "user" ? "You: " : ""}{m.content}</div>
              </div>
            </Link>
          ))}
        </>
      )}

      {data && (
        <>
          <div className="section-title"><Sparkle size={10} /> {data.chats.length ? "Meet someone new" : "Pick someone to talk to"}</div>
          <div className="grid">
            {[...newOwn, ...data.presets.filter((p) => !chattedIds.has(p.id))].map((c) => (
              <CharacterCard key={c.id} c={c} />
            ))}
            <Link href="/create" className="card card-new">
              <div className="plus"><Sparkle size={40} className="twinkle" /></div>
              <div>Create your own</div>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function CharacterCard({ c }: { c: Character }) {
  return (
    <Link href={`/c/${c.id}`} className="card">
      <div className="stage"><CharacterPic c={c} view="full" /></div>
      <div className="name">{c.name}</div>
      <div className="tagline">{c.tagline}</div>
      <div className="chips">
        {c.traits.map((t) => {
          const trait = TRAITS.find((x) => x.id === t);
          return trait ? <span key={t} className="chip">{trait.emoji} {trait.label}</span> : null;
        })}
      </div>
    </Link>
  );
}
