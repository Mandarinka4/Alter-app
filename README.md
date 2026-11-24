# Alter: AI characters that remember you

A mobile-first companion chat MVP. Pick a ready-made character or create your own (look, gender, name, personality traits, tone of voice). Chat in real time, close the tab, come back days later: your characters, your conversations and what they remember about you are still there.

**Stack:** Next.js 16 (App Router) on Vercel · Neon Postgres · Llama 3.3 70B on Groq · DiceBear avatars. Everything runs on free tiers, no credit card.

## How it works

```
Phone browser ──► Next.js on Vercel
                   ├─ /api/characters        list / create characters
                   ├─ /api/characters/[id]   open a chat (history + memory card), reset
                   ├─ /api/chat/[id]         send a message → streamed reply
                   │      1. save user msg   2. build prompt   3. stream from Groq
                   │      4. save reply      5. after(): update memory (background)
                   └─ /api/avatar/[seed]     SVG avatar, generated + cached
                         │
                         ▼
                   Neon Postgres: characters · messages · memories
```

**Personality → behaviour** (`lib/personas.ts`, `lib/prompt.ts`). A character is stored as structured choices, not a free-text prompt. Each trait maps to a concrete behavioural rule (for example *Curious* → "follow up on specifics, max one question per message"). Each tone maps to writing rules plus an example line (for example *Dry* → "short sentences, no emoji, no exclamation marks"). These are compiled into a system prompt with the backstory, chat-style rules (short messages, no markdown) and role rules. A short style reminder is appended after the history to stop the voice drifting in long chats.

**Memory** (`lib/memory.ts`), in two layers:
1. *Short-term:* the last 20 messages are sent verbatim.
2. *Long-term:* a "memory card" per user × character, made of facts about the user plus a running summary of the relationship. Every 6 new messages, a background job (`after()`, so it never delays a reply) asks a small fast model (Llama 3.1 8B) to merge the new messages into the card. The card goes into the system prompt, so prompt size stays flat however long the chat gets. Users can see the card (🧠 button) and wipe it ("Start over").

**Accounts:** none for the MVP. Each browser gets an anonymous id in an httpOnly cookie, and all data hangs off it. This keeps onboarding at zero taps. Trade-off: switching device or clearing cookies loses the data.

**Guardrails:** characters stay in role but don't deny being an AI when sincerely asked. Content is kept PG-13, with a crisis-safety rule. There's a per-user hourly message cap to protect the free API quota, and input length limits.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: add a Groq key
npm run dev                  # http://localhost:3000
```

With no `DATABASE_URL`, it uses an embedded Postgres (PGlite, stored in `.data/`). With no `LLM_API_KEY`, it uses a mock model that echoes, so the whole UI and memory flow can be tried offline.

## Deploy (free, ~10 minutes)

1. **Groq key:** sign up at console.groq.com → *API Keys* → *Create API key*. Copy it.
2. **GitHub:** create an empty repo and push this folder.
3. **Vercel:** sign in with GitHub → *Add New… → Project* → import the repo. Under *Environment Variables* add `LLM_API_KEY` = your Groq key. Deploy.
4. **Database:** in the Vercel project → *Storage* → *Create Database* → **Neon** (free plan) → connect it to the project. This injects `DATABASE_URL`. Tables are created automatically on first request.
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variable is picked up. Open the URL on your phone.

Any OpenAI-compatible provider works: set `LLM_BASE_URL`, `CHAT_MODEL`, `MEMORY_MODEL`.

## Project map

| Path | What |
|---|---|
| `lib/personas.ts` | Traits, tones, preset characters (+ signature habits) |
| `lib/prompt.ts` | Character profile + memory → system prompt |
| `lib/memory.ts` | History window, background memory card updates |
| `lib/llm.ts` | Streaming OpenAI-compatible client, mock fallback |
| `lib/db.ts` | Schema + Postgres access (Neon / PGlite) |
| `app/page.tsx` | Home: your chats + discover |
| `app/create/page.tsx` | Character creator |
| `app/c/[id]/page.tsx` | Chat screen, memory sheet |
