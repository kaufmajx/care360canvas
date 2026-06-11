"use client";

import Link from "next/link";
import { useCanvas } from "@/components/CanvasProvider";
import { JumpScriptControls } from "@/components/JumpScriptControls";
import { ApiKeyButton } from "@/components/ApiKeyButton";
import { BLOCKS, PHASES, PHASE_STYLES } from "@/lib/blocks";

const CARE = [
  ["C", "Conscious", "Lead with self-awareness, intention, empathy"],
  ["A", "Accountable", "Own outcomes, reliability, feedback loops"],
  ["R", "Regenerative", "Give back more than taken, restore balance"],
  ["E", "Evenhanded", "Fair and balanced inclusion, all voices heard"],
];

const PRISM = [
  ["P", "Purpose", "Set intention before acting"],
  ["R", "Reflect", "Surface assumptions, biases, blind spots"],
  ["I", "Interrogate", "Explore tensions, implications, alternatives"],
  ["S", "Synthesize", "Integrate insight into coherent options"],
  ["M", "Measure", "Evaluate impact through the CARE lens"],
];

export default function Home() {
  const { state, hydrated } = useCanvas();
  const completeCount = BLOCKS.filter((b) => state.blocks[b.id].status === "complete").length;
  const started = hydrated && (completeCount > 0 || state.team.teamName !== "");

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 flex flex-wrap justify-center gap-2 text-sm">
            {PHASES.map((p) => {
              const ps = PHASE_STYLES[p];
              return (
                <span
                  key={p}
                  className={`inline-flex items-center gap-1.5 rounded-full ${ps.lightBg} border ${ps.borderLight} px-3 py-1 font-medium ${ps.accentText}`}
                >
                  <span aria-hidden>{ps.emoji}</span> {ps.label}
                </span>
              );
            })}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#2b2b29] sm:text-5xl">
            CARELab Civic Impact Canvas
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-black/60">
            12 AI-powered blocks to unlock sustainable impact — guided by{" "}
            <span className="font-semibold text-[#D85A30]">CARE</span>, empowered by{" "}
            <span className="font-semibold text-[#0E4A82]">PRISM</span>.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/canvas"
              className="rounded-xl bg-[#D85A30] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {started ? "Continue the Canvas →" : "Begin the Canvas →"}
            </Link>
            <ApiKeyButton />
            <JumpScriptControls />
          </div>
          {started && (
            <p className="mt-3 text-sm text-black/50">
              {completeCount} of 12 blocks complete
              {state.team.teamName ? ` · Team ${state.team.teamName}` : ""}
            </p>
          )}
        </header>

        {/* CARE + PRISM explainer */}
        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <Framework
            title="CARE™ — your compass"
            accent="text-[#D85A30]"
            border="border-[#F0A090]"
            bg="bg-[#FDF0EE]"
            items={CARE}
          />
          <Framework
            title="PRISM™ — CARE in AI practice"
            accent="text-[#0E4A82]"
            border="border-[#85B7EB]"
            bg="bg-[#E6F1FB]"
            items={PRISM}
          />
        </section>

        {/* How it flows */}
        <section className="mt-12 rounded-2xl border border-black/10 bg-white/70 p-6">
          <h2 className="text-lg font-bold text-[#2b2b29]">How it works</h2>
          <ol className="mt-4 grid gap-4 text-sm text-black/70 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="1" title="Lay the foundation">
              Enter your core documents, values, and stakeholders in the first three blocks.
            </Step>
            <Step n="2" title="Think with AI">
              Work through nine AI-assisted blocks. Edit each prompt, then chat to flesh out your thinking.
            </Step>
            <Step n="3" title="Deepen with PRISM">
              Challenge assumptions and synthesize — humans decide, AI assists.
            </Step>
            <Step n="4" title="Generate deliverables">
              Produce an editable Executive Summary and 10-slide pitch, then download a PDF.
            </Step>
          </ol>
        </section>

        <footer className="mt-12 text-center text-xs text-black/45">
          AI as Thinking Partner • Humans as Decision Makers. No account, no database — your work
          lives in this browser and in the Jump Script file you save. The AI runs on your own free
          Gemini key (added with the “API key” button, stored only on your device). Save often so
          your team can pick up where you left off.
        </footer>
      </div>
    </main>
  );
}

function Framework({
  title,
  accent,
  border,
  bg,
  items,
}: {
  title: string;
  accent: string;
  border: string;
  bg: string;
  items: string[][];
}) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-6`}>
      <h2 className={`text-lg font-bold ${accent}`}>{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map(([letter, name, desc]) => (
          <li key={letter} className="flex gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold ${accent} shadow-sm`}>
              {letter}
            </span>
            <span className="text-sm">
              <span className="font-semibold text-[#2b2b29]">{name}</span>
              <span className="text-black/55"> — {desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-xl border border-black/10 bg-appbg p-4">
      <div className="mb-1 text-xs font-bold text-black/40">STEP {n}</div>
      <div className="font-semibold text-[#2b2b29]">{title}</div>
      <p className="mt-1 leading-relaxed">{children}</p>
    </li>
  );
}
