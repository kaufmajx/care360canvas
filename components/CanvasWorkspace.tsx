"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BLOCKS, BLOCK_BY_ID, PHASE_STYLES } from "@/lib/blocks";
import { useCanvas } from "./CanvasProvider";
import { Sidebar } from "./Sidebar";
import { BlockView } from "./BlockView";
import { JumpScriptControls } from "./JumpScriptControls";

export function CanvasWorkspace() {
  const { state, hydrated, setBlockStatus } = useCanvas();
  const [activeId, setActiveId] = useState(1);
  const inited = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // On first load, jump to the first block that isn't complete.
  useEffect(() => {
    if (hydrated && !inited.current) {
      inited.current = true;
      const next = BLOCKS.find((b) => state.blocks[b.id].status !== "complete");
      setActiveId(next ? next.id : 1);
    }
  }, [hydrated, state.blocks]);

  // Scroll content to top whenever the active block changes.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

  const block = BLOCK_BY_ID[activeId];
  const status = state.blocks[activeId].status;
  const completeCount = BLOCKS.filter((b) => state.blocks[b.id].status === "complete").length;

  const go = (id: number) => setActiveId(Math.min(12, Math.max(1, id)));

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-white/80 px-4 py-2.5 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#2b2b29]">
          <span aria-hidden>🧭</span>
          <span className="hidden sm:inline">CARE360™ Civic Impact Canvas</span>
          <span className="sm:hidden">CARE360</span>
        </Link>
        <div className="flex items-center gap-2">
          <JumpScriptControls compact />
          <Link
            href="/report"
            className="rounded-lg bg-impact px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Report
          </Link>
        </div>
      </header>

      {/* Segmented progress / quick-jump (also serves as mobile nav) */}
      <div className="z-10 flex shrink-0 items-center gap-3 border-b border-black/10 bg-white/60 px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {BLOCKS.map((b) => {
            const ps = PHASE_STYLES[b.phase];
            const st = state.blocks[b.id].status;
            const active = b.id === activeId;
            const look =
              st === "complete"
                ? `${ps.accentBg} text-white`
                : st === "draft"
                  ? `${ps.lightBg} ${ps.accentText}`
                  : "bg-white text-black/40 border border-black/10";
            return (
              <button
                key={b.id}
                onClick={() => go(b.id)}
                title={`Block ${b.id}: ${block ? b.title : ""}`}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition ${look} ${
                  active ? `ring-2 ring-offset-1 ${ps.ring}` : ""
                }`}
              >
                {b.id}
              </button>
            );
          })}
        </div>
        <span className="ml-auto hidden whitespace-nowrap text-xs font-medium text-black/45 sm:inline">
          {completeCount} / 12 complete
        </span>
      </div>

      {/* Body: sidebar + scrolling main */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-black/10 bg-white/40 md:block">
          <Sidebar activeId={activeId} onSelect={go} />
        </aside>

        <div ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-7">
            {block && <BlockView block={block} />}
          </div>

          {/* Footer nav (sticks to bottom of the scroll area) */}
          <footer className="sticky bottom-0 border-t border-black/10 bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
              <button
                onClick={() => go(activeId - 1)}
                disabled={activeId === 1}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#3a3a38] transition hover:bg-black/5 disabled:opacity-40"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                {status === "complete" ? (
                  <button
                    onClick={() => setBlockStatus(activeId, "draft")}
                    className="rounded-lg border border-[#3D7A00]/40 bg-[#EAF3DE] px-3 py-2 text-sm font-semibold text-[#3D7A00]"
                  >
                    ✓ Completed — reopen
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setBlockStatus(activeId, "draft")}
                      className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#3a3a38] transition hover:bg-black/5"
                    >
                      Save draft
                    </button>
                    <button
                      onClick={() => {
                        setBlockStatus(activeId, "complete");
                        if (activeId < 12) go(activeId + 1);
                      }}
                      className="rounded-lg bg-[#3D7A00] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >
                      Mark complete
                    </button>
                  </>
                )}
              </div>

              {activeId < 12 ? (
                <button
                  onClick={() => go(activeId + 1)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#3a3a38] transition hover:bg-black/5"
                >
                  Next →
                </button>
              ) : (
                <Link
                  href="/report"
                  className="rounded-lg bg-impact px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Finish → Report
                </Link>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
