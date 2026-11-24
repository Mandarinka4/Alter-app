// Minimal client for any OpenAI-compatible chat API (Groq by default).
// No SDK: one fetch + a small SSE parser keeps the moving parts visible.
// Without an API key it falls back to a mock model so the app still runs.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const API_KEY = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "";
export const CHAT_MODEL = process.env.CHAT_MODEL || "llama-3.3-70b-versatile";
export const MEMORY_MODEL = process.env.MEMORY_MODEL || "llama-3.1-8b-instant";
export const isMock = !API_KEY;

export class LLMError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function post(body: object): Promise<Response> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("LLM error", res.status, detail.slice(0, 500));
    const msg =
      res.status === 429
        ? "The model is getting a lot of messages right now. Try again in a minute."
        : "The model didn't answer. Please try again.";
    throw new LLMError(msg, res.status);
  }
  return res;
}

/**
 * Opens a streaming completion. Resolves only once the provider accepted the
 * request, so the caller can still return a clean error before streaming.
 */
export async function openChatStream(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<AsyncGenerator<string>> {
  if (isMock) return mockStream(messages);
  const res = await post({
    model: CHAT_MODEL,
    messages,
    stream: true,
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxTokens ?? 400,
  });
  return parseSSE(res.body!);
}

async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore keep-alives / partial lines */
      }
    }
  }
}

/** Non-streaming JSON completion, used for the background memory pass. */
export async function completeJSON(messages: ChatMessage[]): Promise<any> {
  const res = await post({
    model: MEMORY_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 700,
    response_format: { type: "json_object" },
  });
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
}

// ---------------------------------------------------------------- mock model

async function* mockStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const system = messages[0]?.content ?? "";
  const name = system.match(/^You are (.+?)[,.]/)?.[1] ?? "your companion";
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const reply =
    `(mock model, no API key set) ${name} here. You said: "${lastUser.slice(0, 80)}". ` +
    `Set LLM_API_KEY to hear my real voice.`;
  for (const word of reply.split(/(?<= )/)) {
    await new Promise((r) => setTimeout(r, 25));
    yield word;
  }
}
