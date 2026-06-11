import type { ChatMessage } from "./types";

// ======================================================================
//  AI PROVIDER: Google Gemini (free tier), called directly from the
//  browser using the user's OWN API key (stored only in their browser).
//  There is no server — this app is a fully static site.
//
//  ┌──────────────────────────────────────────────────────────────────┐
//  │  CLAUDE API MIGRATION                                              │
//  │  Swap MODEL + the request/parse below for the Anthropic Messages   │
//  │  API. NOTE: Anthropic does not allow direct browser calls, so a    │
//  │  Claude migration also requires a small server proxy (e.g. a       │
//  │  Cloudflare Pages Function) to hold the key — at which point this  │
//  │  app would no longer be a pure static site.                        │
//  └──────────────────────────────────────────────────────────────────┘
// ======================================================================

const MODEL = "gemini-2.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface GenerateArgs {
  apiKey: string;
  system: string;
  messages: Pick<ChatMessage, "role" | "content">[];
}

export async function generate({ apiKey, system, messages }: GenerateArgs): Promise<string> {
  if (!apiKey.trim()) {
    throw new Error(
      "No Gemini API key set. Click “API key” at the top to add your free key, then try again.",
    );
  }

  // Map our chat history to Gemini's `contents` shape (assistant -> model).
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the AI service. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}) as Record<string, unknown>);

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed (${res.status}).`;
    throw new Error(message);
  }

  const candidate = (data as { candidates?: Array<{ content?: { parts?: { text?: string }[] } }> })
    ?.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text.trim()) {
    const blockReason = (data as { promptFeedback?: { blockReason?: string } })?.promptFeedback
      ?.blockReason;
    throw new Error(
      blockReason
        ? `The model returned no content (blocked: ${blockReason}). Try rephrasing.`
        : "The model returned an empty response. Please try again.",
    );
  }
  return text;
}
