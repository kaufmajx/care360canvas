# CARELab Civic Impact Canvas

A guided, AI-assisted civic innovation tool. Teams work through **12 canvas blocks**
across **4 phases** — ❤️ HeartWare → 🔍 MindWare → 💡 TechWare/AI Unlock → 🚀 Impact —
guided by the **CARE** framework and deepened with **PRISM**. The first three blocks
capture human input; the remaining nine are AI-assisted thinking-partner conversations.
When the team is ready, the app aggregates everything into an editable Executive Summary
and 10-slide pitch outline that can be downloaded as a PDF.

> AI as Thinking Partner • Humans as Decision Makers.

## Tech stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS), built as a static export (`output: "export"`)
- **AI:** Anthropic **Claude (`claude-sonnet-4-6`)** via the official `@anthropic-ai/sdk`, called
  from a **Cloudflare Pages Function** (`functions/api/generate.ts`) so the key stays server-side.
- **No auth, no database** — all state lives in `localStorage` (`carelab_canvas_v1`) and in the
  downloadable **Jump Script** JSON file teams pass between sessions/members.

## Getting started

```bash
npm install
npm run dev      # UI only — fast iteration; /api/generate is NOT served here
```

`next dev` doesn't run the Pages Function, so to exercise the AI locally use the preview command
(Cloudflare's runtime), with the key in `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars   # then set ANTHROPIC_API_KEY=sk-ant-...
npm run preview                  # builds, then runs the function + site in workerd
```

## Deploy to Cloudflare Pages

**Via Git (recommended):** connect the repo in the Cloudflare dashboard
(**Workers & Pages → Create → Pages → Connect to Git**) with:

| Setting          | Value                          |
| ---------------- | ------------------------------ |
| Framework preset | Next.js (Static HTML Export)   |
| Build command    | `npm run build`                |
| Build output dir | `out`                          |

Then set the key: **Pages project → Settings → Variables and Secrets → add `ANTHROPIC_API_KEY`**
(type *Secret*), for Production (and Preview if you use preview deployments). The
`functions/` directory is picked up automatically, and `wrangler.toml` supplies the required
`nodejs_compat` flag.

> Don't paste the key anywhere in the repo — it lives only in the Pages environment (and your
> local, git-ignored `.dev.vars`).

## How the app is structured

```
functions/
  api/generate.ts         Cloudflare Pages Function — server-side Claude proxy (holds the key)
app/
  layout.tsx              Root layout — wraps everything in <CanvasProvider>
  page.tsx                Landing / overview
  canvas/page.tsx         The 12-block workspace (CanvasWorkspace)
  report/page.tsx         The report builder (ReportBuilder)
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
  ai.ts                   Client helper that POSTs to /api/generate
  types.ts                Shared types
```

## The Jump Script

Each team keeps **one Jump Script** — a JSON snapshot of the entire canvas. Use
**Save Jump Script** to download it and **Load** to restore it in any browser. Everything
in it is editable, so teams can collaborate and pick up where they left off.

> Rule to remember: *if it's not in your Jump Script, it doesn't exist.*

## Changing the AI model

The only place the app talks to the model is **`functions/api/generate.ts`** — change the `MODEL`
constant (e.g. `claude-haiku-4-5` for lower cost, `claude-opus-4-8` for max quality). The client
(`lib/ai.ts`) and everything else stay the same.
