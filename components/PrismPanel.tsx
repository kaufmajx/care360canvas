"use client";

import { useState } from "react";
import { PRISM_LENSES } from "@/lib/prism";

// PRISM deepening helper. Picking a question drops it into the composer so
// the team can edit before sending; they can also type their own follow-up.
export function PrismPanel({ onPick }: { onPick: (question: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-black/10 bg-white/70">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-[#3a3a38]">
          🔎 Deepen with PRISM
          <span className="ml-2 font-normal text-black/45">
            Purpose · Reflect · Interrogate · Synthesize · Measure
          </span>
        </span>
        <span className="text-black/40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="grid gap-3 border-t border-black/10 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRISM_LENSES.map((lens) => (
            <div key={lens.key} className="rounded-lg bg-[#F4F3EF] p-3">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#3A3A38] text-[11px] font-bold text-white">
                  {lens.key}
                </span>
                <span className="text-sm font-semibold text-[#3a3a38]">{lens.name}</span>
              </div>
              <p className="mb-2 text-xs text-black/55">{lens.tagline}</p>
              <div className="space-y-1.5">
                {lens.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onPick(q)}
                    className="block w-full rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-left text-xs leading-snug text-[#3a3a38] transition hover:border-black/25 hover:bg-black/[0.03]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
