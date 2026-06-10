"use client";

import { useRef, useState } from "react";
import { useCanvas } from "./CanvasProvider";
import { exportJumpScript, importJumpScript } from "@/lib/storage";

export function JumpScriptControls({ compact = false }: { compact?: boolean }) {
  const { state, replaceState } = useCanvas();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2600);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await importJumpScript(file);
      const ok = window.confirm(
        "Load this Jump Script? It will replace the work currently in this browser.",
      );
      if (ok) {
        replaceState(loaded);
        flash("Jump Script loaded.");
      }
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not load that file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const btn =
    "rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-[#3a3a38] shadow-sm transition hover:bg-black/5";

  return (
    <div className="flex items-center gap-2">
      {msg && (
        <span className="hidden text-xs text-[#3D7A00] sm:inline" role="status">
          {msg}
        </span>
      )}
      <button onClick={() => exportJumpScript(state)} className={btn} title="Download your working document">
        {compact ? "Save" : "Save Jump Script"}
      </button>
      <button onClick={() => fileRef.current?.click()} className={btn} title="Load a Jump Script file">
        Load
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}
