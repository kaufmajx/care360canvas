import { NextRequest, NextResponse } from "next/server";

// ======================================================================
//  AI PROVIDER: Google Gemini (free tier)
//  This route is the ONLY place the app talks to the model. It keeps the
//  API key server-side (never shipped to the browser).
//
//  ┌──────────────────────────────────────────────────────────────────┐
//  │  CLAUDE API MIGRATION                                              │
//  │  To move this app to the Claude (Anthropic) API later:             │
//  │   1. Replace GEMINI_API_KEY with ANTHROPIC_API_KEY.                │
//  │   2. Swap the endpoint/body below for the Anthropic Messages API:  │
//  │        POST https://api.anthropic.com/v1/messages                  │
//  │        headers: { "x-api-key": KEY, "anthropic-version":           │
//  │                    "2023-06-01", "content-type": "application/json"}│
//  │        body: { model: "claude-...", max_tokens, system,            │
//  │               messages: [{ role: "user"|"assistant", content }] }  │
//  │      (Anthropic uses a top-level `system` string and `messages`    │
//  │       with roles user/assistant — close to what we already build.) │
//  │   3. Parse the reply from `data.content[0].text`.                  │
//  │  Only this file needs to change; the client contract is unchanged. │
//  └──────────────────────────────────────────────────────────────────┘
// ======================================================================

// NOTE: the spec text said "gemini-2.5-flash-lite" but the provided
// endpoint URL referenced "gemini-2.5-flash-lite". We use the model that
// matches the endpoint. Change this one constant to switch models.
const GEMINI_MODEL = "gemini-2.5-flash-lite";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

// Resolve the API key from the Node env (local dev / `next start`) or, on
// Cloudflare Workers, from the Worker secret exposed via the OpenNext context.
async function resolveApiKey(): Promise<string | undefined> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as { GEMINI_API_KEY?: string };
    return env?.GEMINI_API_KEY;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = await resolveApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing GEMINI_API_KEY. Set it in .env.local for local dev, or as a Cloudflare Worker secret: `npx wrangler secret put GEMINI_API_KEY`.",
      },
      { status: 500 },
    );
  }

  let body: { system?: string; messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  // Map our chat history to Gemini's `contents` shape (assistant -> model).
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };
  if (body.system) {
    payload.systemInstruction = { parts: [{ text: body.system }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.error?.message ?? `Gemini request failed (${res.status}).`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const candidate = data?.candidates?.[0];
    const text: string =
      candidate?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";

    if (!text.trim()) {
      const blockReason = data?.promptFeedback?.blockReason;
      return NextResponse.json(
        {
          error: blockReason
            ? `The model returned no content (blocked: ${blockReason}). Try rephrasing.`
            : "The model returned an empty response. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the AI service. Check your connection and try again." },
      { status: 502 },
    );
  }
}
