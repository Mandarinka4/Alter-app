# Alter: note for Alessio

**Live:** [your-vercel-url] · **Code:** [your-github-url]

## Main choices and why
- **Next.js on Vercel + Neon Postgres + Groq.** One codebase for UI and API, a free deploy, and a real database. I picked Groq (Llama 3.3 70B) for speed: in a companion app, how fast the first words appear matters as much as reply quality. The client is plain OpenAI-compatible, so changing model or provider is a config change.
- **Personality as structured choices, compiled into behaviour.** The user picks up to 3 traits and a tone. Each trait maps to a concrete rule ("ask at most one question", "drop the sarcasm when they're upset"). Each tone maps to writing rules plus an example line. This gives more consistent characters than a free-text prompt, and keeps the creator fast to use on a phone. A short style reminder after the history stops long chats drifting out of voice.
- **Two-layer memory.** The last 20 messages are sent verbatim. On top of that, every 6 messages a small model (Llama 3.1 8B) runs in the background, after the reply is sent, and updates a "memory card": facts about the user plus a summary of the relationship. That card is part of every prompt. Cost per message stays flat, and old details survive. Users can see the card (🧠) and wipe it, which I think matters for trust in this category.
- **No accounts:** an anonymous httpOnly cookie. There's zero friction before the first chat, and everything persists on that device.
- **Basic guardrails:** characters don't deny being AI when sincerely asked. Content stays PG-13, with a crisis rule. There's a per-user rate limit so the free API key can't be drained.

## What I cut
Login and sync across devices, illustrated or AI-generated portraits (characters are drawn by a small parametric SVG renderer: one drawing, full body when browsing, face crop in chat), editing or deleting characters, LLM-written greetings (custom characters get a template greeting per tone), retrieval over long histories (embeddings), image messages, analytics, tests.

## Time
[roughly X hours, write your real number]

## With another week
1. Accounts with magic link, claiming the anonymous data, so chats follow you across devices.
2. Better memory: embeddings over past messages for recall of specific moments, and memory the character uses proactively ("how did Friday's interview go?" when you open the app).
3. Character quality: richer art (expressions that change with the conversation's mood), an LLM-written backstory and greeting from the user's choices, and a small eval set (scripted conversations scored for staying in voice).
4. Engagement: push notifications or character-initiated messages, then retention metrics (D1/D7, messages per session) to see what actually keeps people coming back.
