"use client";

import type { BlockDef } from "@/lib/blocks";
import { PHASE_STYLES } from "@/lib/blocks";
import { InputFields } from "./blocks/InputBlockView";
import { AiBlockView } from "./blocks/AiBlockView";
import { Markdown } from "./Markdown";

export function BlockView({ block }: { block: BlockDef }) {
  const ps = PHASE_STYLES[block.phase];

  return (
    <article className="space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full ${ps.accentBg} px-3 py-1 text-xs font-semibold text-white`}>
            <span aria-hidden>{ps.emoji}</span> {ps.label}
          </span>
          <span className="text-xs font-medium text-black/40">Block {block.id} of 12</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#2b2b29]">{block.title}</h1>
        <p className="mt-1 text-sm text-black/50">{block.subtitle}</p>
      </header>

      <div className={`rounded-xl border ${ps.borderLight} ${ps.lightBg} p-4`}>
        <div className={`mb-1.5 text-[11px] font-bold uppercase tracking-wide ${ps.accentText}`}>
          Learning
        </div>
        <div className="text-sm leading-relaxed text-[#3a3a38]">
          <Markdown>{block.learning}</Markdown>
        </div>
      </div>

      {block.action && (
        <p className={`flex items-center gap-2 text-sm font-semibold ${ps.accentText}`}>
          <span aria-hidden>→</span> {block.action}
        </p>
      )}

      {block.tip && (
        <div className="rounded-lg border border-black/10 bg-white/70 px-4 py-3 text-xs leading-relaxed text-black/60">
          💡 {block.tip}
        </div>
      )}

      {block.kind === "input" && <InputFields block={block} />}
      {block.kind === "ai" && <AiBlockView block={block} />}
      {block.kind === "hybrid" && (
        <div className="space-y-5">
          <InputFields block={block} />
          <div className="relative py-1">
            <div className="border-t border-black/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-appbg px-3 text-[11px] font-medium uppercase tracking-wide text-black/40">
              Optional · AI helper
            </span>
          </div>
          <AiBlockView block={block} />
        </div>
      )}
    </article>
  );
}
