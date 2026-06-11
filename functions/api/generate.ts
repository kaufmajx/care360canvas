import Anthropic from "@anthropic-ai/sdk";

// ======================================================================
//  Cloudflare Pages Function — POST /api/generate
//  Server-side proxy to the Claude (Anthropic) API. The ANTHROPIC_API_KEY
//  is read from the Pages environment (Settings → Variables and Secrets)
//  and never reaches the browser. The browser calls this same-origin
//  endpoint, so there is no CORS issue.
//
//  Local testing: `npm run preview` (builds, then `wrangler pages dev`,
//  which reads the key from .dev.vars). `next dev` does NOT run this
//  function — use the preview command to exercise the AI end to end.
// ======================================================================

// Model chosen with the user: Claude Sonnet 4.6 (balanced quality/cost).
// Change this one constant to switch models (e.g. "claude-haiku-4-5",
// "claude-opus-4-8"). Do not append a date suffix to the alias.
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  system?: string;
  messages?: IncomingMessage[];
}

// Minimal Pages Function context typing (avoids a dependency on
// @cloudflare/workers-types; Cloudflare bundles the function itself).
interface Context {
  request: Request;
  env: { ANTHROPIC_API_KEY?: string };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context: Context): Promise<Response> {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      {
        error:
          "Missing ANTHROPIC_API_KEY. Add it in the Cloudflare Pages project (Settings → Variables and Secrets), or to .dev.vars for local preview.",
      },
      500,
    );
  }

  let body: RequestBody;
  try {
    body = (await context.request.json()) as RequestBody;
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: "No messages provided." }, 400);
  }

  const client = new Anthropic({ apiKey });

  try {
    const reply = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Anthropic uses a top-level `system` string + user/assistant messages.
      system: body.system?.trim() ? body.system : undefined,
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const text = reply.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!text.trim()) {
      return json(
        { error: "The model returned an empty response. Please try again." },
        502,
      );
    }
    return json({ text });
  } catch (err) {
    // Surface Anthropic's typed errors (e.g. 401 invalid key, 429 rate limit).
    if (err instanceof Anthropic.APIError) {
      const message =
        (err.error as { error?: { message?: string } })?.error?.message ??
        err.message ??
        `AI request failed (${err.status}).`;
      return json({ error: message }, err.status ?? 502);
    }
    return json(
      { error: "Could not reach the AI service. Please try again." },
      502,
    );
  }
}
