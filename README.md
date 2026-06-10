# CARELab Civic Impact Canvas

A guided, AI-assisted civic innovation tool. Teams work through **12 canvas blocks**
across **4 phases** — ❤️ HeartWare → 🔍 MindWare → 💡 TechWare/AI Unlock → 🚀 Impact —
guided by the **CARE** framework and deepened with **PRISM**. The first three blocks
capture human input; the remaining nine are AI-assisted thinking-partner conversations.
When the team is ready, the app aggregates everything into an editable Executive Summary
and 10-slide pitch outline that can be downloaded as a PDF.

> AI as Thinking Partner • Humans as Decision Makers.

## Tech stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **AI:** Google Gemini (`gemini-2.5-flash-lite`, free tier) via a server-side route handler
- **No auth, no database** — all state lives in `localStorage` (`carelab_canvas_v1`) and in
  the downloadable **Jump Script** JSON file teams pass between sessions/members.

## Getting started

```bash
# 1. Add your Gemini API key (free: https://aistudio.google.com/apikey)
cp .env.example .env.local
#   then edit .env.local and set GEMINI_API_KEY=...

# 2. Run the dev server
npm run dev
```

Open http://localhost:3000.

## How the app is structured

```
app/
  layout.tsx              Root layout — wraps everything in <CanvasProvider>
  page.tsx                Landing / overview
  canvas/page.tsx         The 12-block workspace (CanvasWorkspace)
  report/page.tsx         The report builder (ReportBuilder)
  api/generate/route.ts   Server-side Gemini proxy (the ONLY place the key is used)
components/
  CanvasProvider.tsx      localStorage-backed state + autosave
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
  ai.ts                   Client helper that calls /api/generate
  types.ts                Shared types
```

## The Jump Script

Each team keeps **one Jump Script** — a JSON snapshot of the entire canvas. Use
**Save Jump Script** to download it and **Load** to restore it in any browser. Everything
in it is editable, so teams can collaborate and pick up where they left off.

> Rule to remember: *if it's not in your Jump Script, it doesn't exist.*

## Switching to the Claude API later

The app is provider-agnostic everywhere except **`app/api/generate/route.ts`**. Search the
codebase for `CLAUDE API MIGRATION` for step-by-step pointers — only that one route and the
env var name need to change.
