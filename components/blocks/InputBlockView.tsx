"use client";

import type { BlockDef } from "@/lib/blocks";
import { AutoTextarea } from "../AutoTextarea";
import { useCanvas } from "../CanvasProvider";

export function InputFields({ block }: { block: BlockDef }) {
  const { state, setBlockField } = useCanvas();
  const blockState = state.blocks[block.id];
  const fields = block.inputFields ?? [];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.id}>
          <label className="mb-1 block text-sm font-semibold text-[#3a3a38]">
            {f.label}
          </label>
          <AutoTextarea
            value={blockState.fields[f.id] ?? ""}
            placeholder={f.placeholder}
            minRows={f.id === "challengeBrief" || f.id === "careCriteria" ? 5 : 3}
            onChange={(e) => setBlockField(block.id, f.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
