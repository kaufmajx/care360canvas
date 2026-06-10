import type { ChatMessage } from "./types";

// Client-side helper that calls our server route (/api/generate), which in
// turn talks to the model provider. Components never touch the API key.
//
// CLAUDE API MIGRATION: nothing here changes — only app/api/generate/route.ts
// needs updating when switching providers.

export interface GenerateArgs {
  system: string;
  messages: Pick<ChatMessage, "role" | "content">[];
}

export async function generate({ system, messages }: GenerateArgs): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });

  let data: { text?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("The AI service returned an unreadable response.");
  }

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Request failed (${res.status}).`);
  }
  return data.text ?? "";
}
