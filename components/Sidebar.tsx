"use client";

import { BLOCKS, PHASES, PHASE_STYLES } from "@/lib/blocks";
import { useCanvas } from "./CanvasProvider";
import type { BlockStatus } from "@/lib/types";

// Display block titles in sentence case for the nav, keeping the "AI" acronym.
function navCase(title: string): string {
  return (title.charAt(0) + title.slice(1).toLowerCase()).replace(/\bai\b/g, "AI");
}

function StatusDot({ status, color }: { status: BlockStatus; color: string }) {
  if (status === "complete") {
    return (
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${color}`}
        title="Complete"
      >
        ✓
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span
        className={`h-3 w-3 rounded-full border-2 ${color.replace("bg-", "border-")} bg-transparent`}
        title="Draft saved"
      />
    );
  }
  return <span className="h-3 w-3 rounded-full border border-black/15 bg-transparent" title="Not started" />;
}

export function Sidebar({
  activeId,
  onSelect,
}: {
  activeId: number;
  onSelect: (id: number) => void;
}) {
  const { state } = useCanvas();

  return (
    <nav className="flex flex-col gap-5 p-4">
      {PHASES.map((phase) => {
        const ps = PHASE_STYLES[phase];
        const blocks = BLOCKS.filter((b) => b.phase === phase);
        return (
          <div key={phase}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span aria-hidden>{ps.emoji}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${ps.accentText}`}>
                {ps.label}
              </span>
            </div>
            <ul className="space-y-1">
              {blocks.map((b) => {
                const st = state.blocks[b.id].status;
                const active = b.id === activeId;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => onSelect(b.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        active
                          ? `${ps.lightBg} font-semibold ${ps.accentText} ring-1 ${ps.ring}`
                          : "text-[#3a3a38] hover:bg-black/5"
                      }`}
                    >
                      <StatusDot status={st} color={ps.accentBg} />
                      <span className="flex-1 leading-tight">
                        <span className="opacity-50">{b.id}.</span> {navCase(b.title)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
