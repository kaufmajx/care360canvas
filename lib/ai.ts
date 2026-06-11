import type { ChatMessage } from "./types";

// Client-side helper. Calls our same-origin Cloudflare Pages Function
// (/api/generate), which holds the ANTHROPIC_API_KEY server-side and proxies
// to Claude. The browser never sees the key, and there's no CORS to manage.
//
// CLAUDE API MIGRATION: the provider lives entirely in
// functions/api/generate.ts — nothing here changes when swapping models.

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
