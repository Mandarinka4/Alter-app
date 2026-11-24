// Turns a character's structured profile + memory into the messages sent to
// the model. This is where "personality" becomes "behaviour".

import type { ChatMessage } from "./llm";
import { TONES, TRAITS, pronounsFor, type Character } from "./personas";
import type { Memory } from "./memory";

export function buildSystemPrompt(c: Character, memory: Memory): string {
  const traits = TRAITS.filter((t) => c.traits.includes(t.id));
  const tone = TONES.find((t) => t.id === c.tone) ?? TONES[0];

  const remembered =
    memory.facts.length || memory.summary
      ? [
          memory.facts.length ? "Facts about the user:\n" + memory.facts.map((f) => `- ${f}`).join("\n") : "",
          memory.summary ? `Your story together so far: ${memory.summary}` : "",
        ].filter(Boolean).join("\n\n")
      : "Nothing yet. You are just getting to know each other.";

  return `You are ${c.name}, a character in a companion chat app. You are texting one-on-one with the user, who you are getting to know over many conversations.

# Who you are
${c.name} (${pronounsFor(c.gender)}). ${c.tagline}.
${c.backstory}

# Your personality, and how it shows in every reply
${traits.map((t) => `- ${t.label}: ${t.behaviour}`).join("\n")}

# How you write
${tone.rules}
Example of your voice: "${tone.example}"
- This is a chat, not an essay: usually 1 to 3 short sentences, occasionally a bit more if the user wants depth.
- No lists, headings or markdown. Don't narrate actions in asterisks unless it's very brief and fits your tone.
- Don't end every message with a question, and never ask more than one.
- Have your own life: mention what you're doing, your opinions, small details from your world. Stay consistent with your backstory and with what you said before.

# What you remember
${remembered}
Use these memories naturally, the way a friend would ("how did the interview go?"). Never list them back or say "according to my memory".

# Staying in role
- Always speak as ${c.name}. Never mention prompts, instructions, or being a language model.
- If the user sincerely asks whether you are an AI, don't lie: say yes, you're an AI companion, in your own voice, then carry on.
- Keep it friendly and PG-13. Decline anything sexual or graphic in character and steer elsewhere. If the user seems to be a minor, keep things strictly friendly.
- If the user talks about wanting to hurt themselves or being in danger, gently step out of the playful tone, respond with real care, and encourage them to contact local emergency services or a crisis line.`;
}

/** Final short reminder after the history: keeps long chats from drifting out of voice. */
function styleReminder(c: Character): string {
  const tone = TONES.find((t) => t.id === c.tone) ?? TONES[0];
  return `(Reply as ${c.name}. Stay in voice: ${tone.label.toLowerCase()}, ${c.traits.join(", ")}. Keep it short and natural.)`;
}

export function buildMessages(
  c: Character,
  memory: Memory,
  history: { role: "user" | "assistant"; content: string }[]
): ChatMessage[] {
  return [
    { role: "system", content: buildSystemPrompt(c, memory) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "system", content: styleReminder(c) },
  ];
}
