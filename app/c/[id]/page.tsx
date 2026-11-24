"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { Character } from "@/lib/personas";
import { dayLabel } from "@/lib/time";

type Msg = { id: number | string; role: "user" | "assistant"; content: string; createdAt: string };
type MemoryCard = { facts: string[]; summary: string };

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [memory, setMemory] = useState<MemoryCard>({ facts: [], summary: "" });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<{ text: string; retry?: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    const res = await fetch(`/api/characters/${id}`, { cache: "no-store" });
    if (!res.ok) return setNotFound(true);
    const data = await res.json();
    setCharacter(data.character);
    setMessages(data.messages);
    setMemory(data.memory);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: messages.length > 30 ? "auto" : "smooth" });
  }, [messages, streaming]);

  async function send(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || streaming) return;
    setError(null);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const now = new Date().toISOString();
    const replyId = `r${Date.now()}`;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", content: text, createdAt: now }]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't reach the character.");
      }
      setMessages((m) => [...m, { id: replyId, role: "assistant", content: "", createdAt: now }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, content: x.content + chunk } : x)));
      }
    } catch (e) {
      // Remove the unsent message and offer a retry.
      setMessages((m) => m.filter((x) => !(x.role === "user" && x.content === text && x.createdAt === now) && x.id !== replyId));
      setError({ text: e instanceof Error ? e.message : "Something went wrong.", retry: text });
    } finally {
      setStreaming(false);
      // Memory is updated in the background after the reply; refresh the card a moment later.
      setTimeout(refreshMemory, 2500);
    }
  }

  async function refreshMemory() {
    const res = await fetch(`/api/characters/${id}`, { cache: "no-store" });
    if (res.ok) setMemory((await res.json()).memory);
  }

  async function startOver() {
    if (!confirm(`Start over with ${character?.name}? This deletes the conversation and everything they remember about you.`)) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    setShowMemory(false);
    await load();
  }

  if (notFound) {
    return (
      <main className="page center">
        <div style={{ textAlign: "center" }}>
          <p>This character doesn’t exist (or belongs to someone else).</p>
          <button className="btn" onClick={() => router.push("/")}>Go home</button>
        </div>
      </main>
    );
  }

  const lastIsEmptyReply = streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1].content;
  const waitingForFirstToken = streaming && messages[messages.length - 1]?.role === "user";

  return (
    <div className="chat">
      <header className="chat-header">
        <Link href="/" className="icon-btn" aria-label="Back">←</Link>
        {character && <Avatar seed={character.avatarSeed} gender={character.gender} size={40} />}
        <div className="who">
          <div className="n">{character?.name ?? " "}</div>
          <div className="s">{streaming ? "typing…" : character?.tagline}</div>
        </div>
        <button className="icon-btn" aria-label="What they remember" onClick={() => setShowMemory(true)} disabled={!character}>🧠</button>
      </header>

      <div className="messages" ref={listRef}>
        {messages.map((m, i) => {
          const showDay = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i - 1].createdAt).toDateString();
          if (m.role === "assistant" && !m.content) return null;
          return (
            <Fragment key={m.id}>
              {showDay && <div className="day">{dayLabel(m.createdAt)}</div>}
              <div className={`bubble ${m.role}`}>{m.content}</div>
            </Fragment>
          );
        })}
        {(waitingForFirstToken || lastIsEmptyReply) && (
          <div className="bubble assistant"><span className="typing"><i /><i /><i /></span></div>
        )}
        {error && (
          <div className="bubble err">
            {error.text}
            {error.retry && (
              <div style={{ marginTop: 6 }}>
                <button className="btn btn-small" onClick={() => send(error.retry)}>Try again</button>
              </div>
            )}
          </div>
        )}
      </div>

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          placeholder={character ? `Message ${character.name}` : "Message"}
          maxLength={2000}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
          }}
          onKeyDown={(e) => {
            // Enter sends on desktop; on phones the return key inserts a newline.
            if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="send" type="submit" disabled={!input.trim() || streaming} aria-label="Send">↑</button>
      </form>

      {showMemory && character && (
        <div className="sheet-backdrop" onClick={() => setShowMemory(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>What {character.name} remembers</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
              Updated in the background every few messages. The last 20 messages are always in view too.
            </p>
            {memory.facts.length === 0 && !memory.summary ? (
              <p className="muted">Nothing yet. Tell {character.name} a bit about yourself.</p>
            ) : (
              <>
                {memory.facts.length > 0 && (
                  <>
                    <div className="section-title" style={{ marginTop: 16 }}>About you</div>
                    <ul>{memory.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}
                {memory.summary && (
                  <>
                    <div className="section-title">Your story so far</div>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{memory.summary}</p>
                  </>
                )}
              </>
            )}
            <div className="section-title">About {character.name}</div>
            <p style={{ margin: 0, lineHeight: 1.5 }} className="muted">{character.backstory || character.tagline}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowMemory(false)}>Close</button>
              <button className="btn" style={{ flex: 1, color: "var(--danger)" }} onClick={startOver}>Start over</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
