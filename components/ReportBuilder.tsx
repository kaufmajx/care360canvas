"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOCKS, BLOCK_BY_ID } from "@/lib/blocks";
import { useCanvas } from "./CanvasProvider";
import { AutoTextarea } from "./AutoTextarea";
import { Markdown } from "./Markdown";
import { ApiKeyButton } from "./ApiKeyButton";
import { generate } from "@/lib/ai";
import { buildSystemContext, getBlockReportText } from "@/lib/context";
import type { CanvasState } from "@/lib/types";

// Compose a block's content from its source (fields or last AI answer),
// ignoring any existing write-up — used by the "Pull from block" action.
function composeSource(state: CanvasState, id: number): string {
  const def = BLOCK_BY_ID[id];
  const bs = state.blocks[id];
  if (def.inputFields?.length) {
    const lines = def.inputFields
      .map((f) => {
        const v = (bs.fields[f.id] ?? "").trim();
        return v ? `${f.label}: ${v}` : "";
      })
      .filter(Boolean);
    if (lines.length) return lines.join("\n");
  }
  const lastAi = [...bs.messages].reverse().find((m) => m.role === "assistant");
  return lastAi ? lastAi.content.trim() : "";
}

function parseDeliverables(raw: string): { exec: string; pitch: string } {
  const text = raw.trim().replace(/===\s*EXECUTIVE SUMMARY\s*===/i, "").trim();
  const m = text.match(/={0,3}\s*PITCH DECK(?:\s+OUTLINE)?\s*={0,3}/i);
  if (m && m.index !== undefined) {
    return {
      exec: text.slice(0, m.index).trim(),
      pitch: text.slice(m.index + m[0].length).trim(),
    };
  }
  return { exec: text, pitch: "" };
}

const card = "rounded-2xl border border-black/10 bg-white p-5 shadow-sm";
const fieldInput =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-black/20";

export function ReportBuilder() {
  const { state, apiKey, setTeam, setSolution, setReport, setFinalWriteup } = useCanvas();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWriteups, setShowWriteups] = useState(false);

  const { report, team } = state;
  const filledCount = BLOCKS.filter(
    (b) => b.id <= 11 && getBlockReportText(state, b.id).trim() !== "",
  ).length;

  async function generateReport() {
    setLoading(true);
    setError(null);
    try {
      const system = buildSystemContext(state, 12);
      const writeups = BLOCKS.filter((b) => b.id <= 11)
        .map((b) => `### Block ${b.id}: ${b.title}\n${getBlockReportText(state, b.id) || "(left blank)"}`)
        .join("\n\n");
      const deliver = BLOCK_BY_ID[12].prompts![0].text;
      const guide = report.pitchGuidelines.trim()
        ? `\n\nPowerPoint pitch guidelines to follow:\n${report.pitchGuidelines.trim()}`
        : "";
      const meta = `Team: ${team.teamName || "(unnamed)"} · Project: ${
        team.projectName || "(untitled)"
      } · Members: ${team.members || "(not listed)"}${
        state.solution.name ? ` · Solution: ${state.solution.name}` : ""
      }`;
      const user = `Here are our team's curated canvas write-ups, block by block:\n\n${writeups}\n\n${meta}\n\n${deliver}${guide}\n\nFormat your ENTIRE response using these exact section markers, each on its own line:\n=== EXECUTIVE SUMMARY ===\n(the one-page executive summary)\n=== PITCH DECK OUTLINE ===\n(the 10-slide outline)`;

      const reply = await generate({
        apiKey,
        system,
        messages: [{ role: "user", content: user }],
      });
      const { exec, pitch } = parseDeliverables(reply);
      setReport({
        executiveSummary: exec,
        pitchDeck: pitch,
        generatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the report.");
    } finally {
      setLoading(false);
    }
  }

  const hasReport = report.executiveSummary.trim() !== "" || report.pitchDeck.trim() !== "";
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/10 bg-white/85 px-4 py-2.5 backdrop-blur">
        <Link href="/canvas" className="text-sm font-medium text-[#3a3a38] hover:underline">
          ← Back to canvas
        </Link>
        <span className="text-sm font-bold text-[#2b2b29]">🚀 Impact Deliverables</span>
        <div className="flex items-center gap-2">
          <ApiKeyButton />
          <button
            onClick={() => window.print()}
            disabled={!hasReport}
            className="rounded-lg bg-impact px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-7">
        {/* 1. Team & solution */}
        <section className={`no-print ${card}`}>
          <h2 className="text-base font-bold text-[#2b2b29]">1 · Your team</h2>
          <p className="mt-1 text-xs text-black/50">
            These appear on the cover of your report. Fill them in before generating.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[#3a3a38]">Team name</span>
              <input
                className={fieldInput}
                value={team.teamName}
                onChange={(e) => setTeam({ teamName: e.target.value })}
                placeholder="e.g., Team Catalyst"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[#3a3a38]">Project name</span>
              <input
                className={fieldInput}
                value={team.projectName}
                onChange={(e) => setTeam({ projectName: e.target.value })}
                placeholder="Your venture / project title"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-[#3a3a38]">Team members</span>
              <input
                className={fieldInput}
                value={team.members}
                onChange={(e) => setTeam({ members: e.target.value })}
                placeholder="Names, comma-separated"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-[#3a3a38]">Solution name</span>
              <input
                className={fieldInput}
                value={state.solution.name}
                onChange={(e) => setSolution({ name: e.target.value })}
                placeholder="Your solution's name"
              />
            </label>
          </div>
        </section>

        {/* 2. Curate write-ups */}
        <section className={`no-print ${card}`}>
          <button
            onClick={() => setShowWriteups((s) => !s)}
            className="flex w-full items-center justify-between text-left"
          >
            <span>
              <span className="text-base font-bold text-[#2b2b29]">2 · Select your write-ups</span>
              <span className="ml-2 text-xs text-black/50">{filledCount} / 11 blocks have content</span>
            </span>
            <span className="text-black/40">{showWriteups ? "▲" : "▼"}</span>
          </button>
          {showWriteups && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-black/50">
                This is exactly what the AI will summarize. Edit any block’s write-up here, or pull
                its content straight from the canvas.
              </p>
              {BLOCKS.filter((b) => b.id <= 11).map((b) => (
                <div key={b.id} className="rounded-xl border border-black/10 bg-appbg p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#3a3a38]">
                      {b.emoji} Block {b.id}: {b.title}
                    </span>
                    <button
                      onClick={() => {
                        const src = composeSource(state, b.id);
                        if (!src) return;
                        if (
                          state.blocks[b.id].finalWriteup.trim() &&
                          !window.confirm("Replace this write-up with the block's content?")
                        )
                          return;
                        setFinalWriteup(b.id, src);
                      }}
                      className="rounded-md border border-black/10 bg-white px-2 py-0.5 text-[11px] font-medium text-[#3a3a38] hover:bg-black/5"
                    >
                      Pull from block
                    </button>
                  </div>
                  <AutoTextarea
                    value={state.blocks[b.id].finalWriteup}
                    minRows={2}
                    placeholder="Empty — write here or pull from the block."
                    onChange={(e) => setFinalWriteup(b.id, e.target.value)}
                  />
                </div>
              ))}
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#3a3a38]">
                  PowerPoint pitch guidelines (optional)
                </span>
                <AutoTextarea
                  value={report.pitchGuidelines}
                  minRows={2}
                  placeholder="Paste any pitch-deck guidelines you want the 10-slide outline to follow."
                  onChange={(e) => setReport({ pitchGuidelines: e.target.value })}
                />
              </label>
            </div>
          )}
        </section>

        {/* 3. Generate */}
        <section className={`no-print ${card}`}>
          <h2 className="text-base font-bold text-[#2b2b29]">3 · Generate deliverables</h2>
          <p className="mt-1 text-xs text-black/50">
            The AI aggregates your curated write-ups into a one-page Executive Summary and a
            10-slide pitch outline. You can edit both afterward.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={generateReport}
              disabled={loading}
              className="rounded-lg bg-[#D85A30] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generating…" : hasReport ? "Regenerate" : "Generate report"}
            </button>
            {report.generatedAt && !loading && (
              <span className="text-xs text-black/45">
                Last generated {new Date(report.generatedAt).toLocaleString()}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-3 rounded-lg border border-[#D85A30]/40 bg-[#FDF0EE] px-4 py-3 text-sm text-[#D85A30]">
              {error}
            </div>
          )}
        </section>

        {/* 4. Edit results */}
        {hasReport && (
          <section className={`no-print ${card}`}>
            <h2 className="text-base font-bold text-[#2b2b29]">4 · Edit before downloading</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#3a3a38]">Executive Summary</span>
                <AutoTextarea
                  value={report.executiveSummary}
                  minRows={8}
                  onChange={(e) => setReport({ executiveSummary: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#3a3a38]">Pitch Deck Outline</span>
                <AutoTextarea
                  value={report.pitchDeck}
                  minRows={8}
                  onChange={(e) => setReport({ pitchDeck: e.target.value })}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-black/45">
              Markdown is supported (tables, headings, lists). The preview below is what prints.
            </p>
          </section>
        )}

        {/* 5. Printable preview */}
        {hasReport ? (
          <section className="print-area rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="border-b border-black/10 pb-4">
              <h1 className="text-2xl font-bold text-[#2b2b29]">
                {team.projectName || "Civic Impact Report"}
              </h1>
              <p className="mt-1 text-sm text-black/55">
                {team.teamName ? `Team ${team.teamName}` : "CARELab Civic Impact Canvas"}
                {team.members ? ` · ${team.members}` : ""}
              </p>
              <p className="text-xs text-black/40">CARELab Civic Impact Canvas · {today}</p>
            </div>

            {report.executiveSummary.trim() && (
              <div className="mt-6">
                <h2 className="mb-2 text-lg font-bold text-[#D85A30]">Executive Summary</h2>
                <Markdown>{report.executiveSummary}</Markdown>
              </div>
            )}

            {report.pitchDeck.trim() && (
              <div className="mt-8 print-page-break">
                <h2 className="mb-2 text-lg font-bold text-[#0E4A82]">Pitch Deck Outline</h2>
                <Markdown>{report.pitchDeck}</Markdown>
              </div>
            )}
          </section>
        ) : (
          <p className="no-print rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-sm text-black/45">
            Your generated report preview will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
