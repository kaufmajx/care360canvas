"use client";

import { useState } from "react";
import type { BlockDef } from "@/lib/blocks";
import { BLOCKS, PHASE_STYLES } from "@/lib/blocks";
import type { ChatMessage } from "@/lib/types";
import { useCanvas } from "../CanvasProvider";
import { generate } from "@/lib/ai";
import { buildSystemContext, substituteSolution } from "@/lib/context";
import { Markdown } from "../Markdown";
import { AutoTextarea } from "../AutoTextarea";
import { PrismPanel } from "../PrismPanel";

export function AiBlockView({ block }: { block: BlockDef }) {
  const { state, addMessage, setPromptDraft, clearMessages, setFinalWriteup } =
    useCanvas();
  const bs = state.blocks[block.id];
  const ps = PHASE_STYLES[block.phase];

  const [composer, setComposer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(bs.messages.length === 0);

  const prompts = block.prompts ?? [];

  async function run(rawText: string, kind: ChatMessage["kind"]) {
    const content = substituteSolution(rawText.trim(), state.solution.name);
    if (!content || loading) return;
    const userMsg: ChatMessage = { role: "user", content, ts: Date.now(), kind };
    const history = [...bs.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    addMessage(block.id, userMsg);
    setLoading(true);
    setError(null);
    try {
      const system = buildSystemContext(state, block.id);
      const reply = await generate({ system, messages: history });
      addMessage(block.id, { role: "assistant", content: reply, ts: Date.now() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const sendComposer = () => {
    if (!composer.trim()) return;
    run(composer, "freeform");
    setComposer("");
  };

  const appendToWriteup = (text: string) => {
    const existing = bs.finalWriteup.trim();
    setFinalWriteup(block.id, existing ? `${existing}\n\n${text}` : text);
  };

  // "Create Your Jump Script" — the same synthesis prompt run at the end of
  // every block; its result becomes the block write-up.
  async function summarizeBlock() {
    if (loading) return;
    if (
      bs.finalWriteup.trim() &&
      !window.confirm("Replace your block write-up with an AI-generated Jump Script summary?")
    )
      return;
    const content =
      "Synthesize all of the essential information from this block into 1-2 concise paragraphs and also include a table or bullet points to assist with the clear summary.";
    const history = [...bs.messages, { role: "user" as const, content }].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setLoading(true);
    setError(null);
    try {
      const system = buildSystemContext(state, block.id);
      const reply = await generate({ system, messages: history });
      setFinalWriteup(block.id, reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const lastAssistant = [...bs.messages].reverse().find((m) => m.role === "assistant");

  // What foundation/earlier work grounds this block's AI calls (shown to the
  // user, and actually sent via buildSystemContext on every request).
  const hasFields = (id: number) =>
    Object.values(state.blocks[id].fields).some((v) => v.trim());
  const foundation: string[] = [];
  if (hasFields(1)) foundation.push("Core documents");
  if (hasFields(2)) foundation.push("Values & beliefs");
  if (hasFields(3)) foundation.push("Stakeholders");
  const priorCount = BLOCKS.filter(
    (b) =>
      b.id < block.id &&
      b.kind !== "input" &&
      (state.blocks[b.id].finalWriteup.trim() ||
        state.blocks[b.id].messages.some((m) => m.role === "assistant")),
  ).length;
  const isGrounded = foundation.length > 0 || priorCount > 0;

  const sendBtn =
    "rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 " +
    ps.accentBg + " hover:opacity-90";

  return (
    <div className="space-y-5">
      {/* Solution capture / reminder */}
      <SolutionPanel block={block} onUseResponse={lastAssistant?.content} />

      {/* Grounding indicator — shows the Blocks 1–3 foundation + earlier work
          that's fed into every AI call for this block. */}
      <div className="flex items-start gap-2 rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-xs text-black/55">
        <span aria-hidden>🔗</span>
        {isGrounded ? (
          <span>
            Grounded in your foundation
            {foundation.length > 0 && (
              <>
                : <span className="font-medium text-[#3a3a38]">{foundation.join(" · ")}</span>
              </>
            )}
            {priorCount > 0 && (
              <>
                {" "}
                + {priorCount} earlier block{priorCount > 1 ? "s" : ""}
              </>
            )}
            . The AI uses this automatically — no need to repeat it.
          </span>
        ) : (
          <span>
            Tip: fill in Blocks 1–3 (your foundation) first — the AI uses them to ground every
            answer in this block.
          </span>
        )}
      </div>

      {/* Editable prompt(s) */}
      <div className="rounded-xl border border-black/10 bg-white/70">
        <button
          onClick={() => setShowPrompts((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        >
          <span className="text-sm font-semibold text-[#3a3a38]">
            ✏️ {prompts.length > 1 ? "Prompts" : "Prompt"} — edit before sending
          </span>
          <span className="text-black/40">{showPrompts ? "▲" : "▼"}</span>
        </button>

        {showPrompts && (
          <div className="space-y-4 border-t border-black/10 p-4">
            {prompts.map((p) => {
              const draft = bs.promptDrafts[p.id] ?? p.text;
              return (
                <div key={p.id}>
                  {prompts.length > 1 && (
                    <div className={`mb-1 text-xs font-bold uppercase tracking-wide ${ps.accentText}`}>
                      {p.label}
                    </div>
                  )}
                  <AutoTextarea
                    value={draft}
                    minRows={4}
                    onChange={(e) => setPromptDraft(block.id, p.id, e.target.value)}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => run(draft, "prompt")} disabled={loading} className={sendBtn}>
                      Send to AI
                    </button>
                    <button
                      onClick={() => setPromptDraft(block.id, p.id, p.text)}
                      className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#3a3a38] transition hover:bg-black/5"
                    >
                      Reset to default
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation */}
      {(bs.messages.length > 0 || loading) && (
        <div className="space-y-3">
          {bs.messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-[#3A3A38] px-4 py-2.5 text-sm text-white shadow-sm">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                  {m.kind === "prompt" ? "Prompt sent" : m.kind === "prism" ? "PRISM" : "You"}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ) : (
              <div key={i} className={`rounded-xl rounded-tl-sm border ${ps.borderLight} ${ps.lightBg} px-4 py-3 shadow-sm`}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${ps.accentText}`}>
                    AI thinking partner
                  </span>
                  <button
                    onClick={() => appendToWriteup(m.content)}
                    className="rounded-md border border-black/10 bg-white px-2 py-0.5 text-[11px] font-medium text-[#3a3a38] transition hover:bg-black/5"
                    title="Add this response to your block write-up"
                  >
                    ＋ Add to write-up
                  </button>
                </div>
                <Markdown>{m.content}</Markdown>
              </div>
            ),
          )}
          {loading && (
            <div className={`rounded-xl rounded-tl-sm border ${ps.borderLight} ${ps.lightBg} px-4 py-3 text-sm text-black/55`}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-black/40" />
                Thinking…
              </span>
            </div>
          )}
          {bs.messages.length > 0 && !loading && (
            <button
              onClick={() => {
                if (window.confirm("Clear this block's conversation? (Your write-up is kept.)"))
                  clearMessages(block.id);
              }}
              className="text-xs text-black/40 underline-offset-2 hover:underline"
            >
              Clear conversation
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#D85A30]/40 bg-[#FDF0EE] px-4 py-3 text-sm text-[#D85A30]">
          {error}
        </div>
      )}

      {/* PRISM */}
      <PrismPanel onPick={(q) => setComposer(q)} />

      {/* Follow-up composer */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-[#3a3a38]">
          Ask a follow-up
        </label>
        <AutoTextarea
          value={composer}
          minRows={2}
          placeholder="Interrogate, refine, or ask for supporting detail… (⌘/Ctrl + Enter to send)"
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              sendComposer();
            }
          }}
        />
        <div className="mt-2">
          <button onClick={sendComposer} disabled={loading || !composer.trim()} className={sendBtn}>
            Send
          </button>
        </div>
      </div>

      {/* Block write-up for the report */}
      <div className={`rounded-xl border ${ps.borderLight} bg-white p-4`}>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-semibold text-[#3a3a38]">
            📝 Your block write-up
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={summarizeBlock}
              disabled={loading}
              title="Ask AI to synthesize this block into a Jump Script summary"
              className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[#3a3a38] transition hover:bg-black/5 disabled:opacity-50"
            >
              ✨ Create Jump Script summary
            </button>
            {lastAssistant && (
              <button
                onClick={() => appendToWriteup(lastAssistant.content)}
                className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[#3a3a38] transition hover:bg-black/5"
              >
                Use latest AI response
              </button>
            )}
          </div>
        </div>
        <p className="mb-2 text-xs text-black/50">
          Synthesize the team’s conclusion for this block in your own words. This is what flows into your final report — edit freely.
        </p>
        <AutoTextarea
          value={bs.finalWriteup}
          minRows={4}
          placeholder="Adjust the language to sound like your team, not AI."
          onChange={(e) => setFinalWriteup(block.id, e.target.value)}
        />
      </div>
    </div>
  );
}

// Block 8 captures the solution; Blocks 9–12 just need the name available
// so "[ENTER your solution name]" can be substituted into prompts.
function SolutionPanel({
  block,
  onUseResponse,
}: {
  block: BlockDef;
  onUseResponse?: string;
}) {
  const { state, setSolution } = useCanvas();
  const isCapture = block.id === 7;
  const usesName = block.id >= 8 && block.id <= 12;
  if (!isCapture && !usesName) return null;

  if (isCapture) {
    return (
      <div className="rounded-xl border border-techware-border bg-techware-light p-4">
        <div className="mb-1 text-sm font-bold text-techware">🎯 Our selected solution</div>
        <p className="mb-3 text-xs text-black/55">
          Capture your team’s synthesized solution here. It carries into Blocks 8–12 and replaces
          the “[ENTER your solution name]” placeholders automatically.
        </p>
        <div className="space-y-3">
          <input
            value={state.solution.name}
            onChange={(e) => setSolution({ name: e.target.value })}
            placeholder="Solution name"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-black/20"
          />
          <AutoTextarea
            value={state.solution.summary}
            minRows={3}
            placeholder="One-paragraph solution summary (all essential information)."
            onChange={(e) => setSolution({ summary: e.target.value })}
          />
          {onUseResponse && (
            <button
              onClick={() => setSolution({ summary: onUseResponse })}
              className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[#3a3a38] transition hover:bg-black/5"
            >
              Use latest AI response as summary
            </button>
          )}
        </div>
      </div>
    );
  }

  // Blocks 9–12: compact name field
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-techware-border bg-techware-light px-4 py-3">
      <span className="text-sm font-semibold text-techware">🎯 Solution:</span>
      <input
        value={state.solution.name}
        onChange={(e) => setSolution({ name: e.target.value })}
        placeholder="Name your solution (used in the prompt)"
        className="min-w-[14rem] flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-black/20"
      />
    </div>
  );
}
