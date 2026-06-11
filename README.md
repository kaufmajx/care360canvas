# CARELab Civic Impact Canvas

A guided, AI-assisted civic innovation tool. Teams work through **12 canvas blocks**
across **4 phases** — ❤️ HeartWare → 🔍 MindWare → 💡 TechWare/AI Unlock → 🚀 Impact —
guided by the **CARE** framework and deepened with **PRISM**. The first three blocks
capture human input; the remaining nine are AI-assisted thinking-partner conversations.
When the team is ready, the app aggregates everything into an editable Executive Summary
and 10-slide pitch outline that can be downloaded as a PDF.

> AI as Thinking Partner • Humans as Decision Makers.

## Tech stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS), built as a **static site** (`output: "export"`)
- **AI:** Google Gemini (`gemini-2.5-flash-lite`, free tier), called **directly from the browser**
  using each user's own key — there is no backend.
- **No server, no auth, no database** — all state lives in `localStorage` (`carelab_canvas_v1`)
  and in the downloadable **Jump Script** JSON file teams pass between sessions/members.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000, click **🔑 API key**, and paste a free Gemini key
(https://aistudio.google.com/apikey). The key is stored only in your browser.

## Deploy to Cloudflare Pages

It's a static site, so deployment is just "build and upload a folder."

**Via Git (recommended):** connect the repo in the Cloudflare dashboard
(**Workers & Pages → Create → Pages → Connect to Git**) with:

| Setting          | Value                          |
| ---------------- | ------------------------------ |
| Framework preset | Next.js (Static HTML Export)   |
| Build command    | `npm run build`                |
| Build output dir | `out`                          |

There is **no environment variable / secret to set** — each user enters their own Gemini
key in the app. (That key is browser-only and is *not* saved into a Jump Script.)

**Via CLI (one-off):**

```bash
npm run build
npx wrangler pages deploy out
```

## How the app is structured

```
app/
  layout.tsx              Root layout — wraps everything in <CanvasProvider>
  page.tsx                Landing / overview
  canvas/page.tsx         The 12-block workspace (CanvasWorkspace)
  report/page.tsx         The report builder (ReportBuilder)
components/
  ApiKeyButton.tsx        Header button + modal for the user's own Gemini key
  CanvasProvider.tsx      localStorage-backed state + autosave (+ API key)
  CanvasWorkspace.tsx     App shell: header, progress, sidebar, footer nav
  BlockView.tsx           Block header (verbatim learning text) + body dispatcher
  blocks/InputBlockView   Human-input fields (Blocks 1–3)
  blocks/AiBlockView      Editable prompt + chat + write-up (Blocks 3–12)
  PrismPanel.tsx          PRISM deepening questions (2 per lens + freeform)
  ReportBuilder.tsx       Team info, write-up curation, generation, PDF
lib/
  blocks.ts               Single source of truth — 12 blocks, verbatim prompts, phase styles
  prism.ts                PRISM lenses + questions
  storage.ts              localStorage + Jump Script import/export
  context.ts              Builds the AI grounding context from prior blocks
  ai.ts                   Calls the Gemini API directly from the browser
  types.ts                Shared types
```

## The Jump Script

Each team keeps **one Jump Script** — a JSON snapshot of the entire canvas. Use
**Save Jump Script** to download it and **Load** to restore it in any browser. Everything
in it is editable, so teams can collaborate and pick up where they left off.

> Rule to remember: *if it's not in your Jump Script, it doesn't exist.*

## Switching to the Claude API later

The only AI integration point is **`lib/ai.ts`** (search for `CLAUDE API MIGRATION`). Note that
Anthropic does not allow direct browser calls, so a Claude migration would require adding a small
server proxy to hold the key (e.g. a Cloudflare Pages Function) — at which point the app would no
longer be a pure static site.
