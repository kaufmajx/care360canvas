import type { BlockState, CanvasState } from "./types";
import { BLOCKS } from "./blocks";

export const STORAGE_KEY = "carelab_canvas_v1";

function emptyBlock(): BlockState {
  return {
    fields: {},
    promptDrafts: {},
    messages: [],
    finalWriteup: "",
    status: "empty",
  };
}

export function createDefaultState(): CanvasState {
  const blocks: Record<number, BlockState> = {};
  for (const b of BLOCKS) blocks[b.id] = emptyBlock();
  return {
    version: 1,
    schema: "carelab_canvas_v1",
    team: { members: "", teamName: "", projectName: "" },
    solution: { name: "", summary: "" },
    blocks,
    report: {
      pitchGuidelines: "",
      executiveSummary: "",
      pitchDeck: "",
      generatedAt: null,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Merge a loaded/partial object onto a fresh default so that missing keys
 * (e.g. from an older Jump Script) never crash the app. Users are free to
 * edit anything, so we stay permissive rather than strict.
 */
export function normalizeState(raw: unknown): CanvasState {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Partial<CanvasState>;

  if (obj.team && typeof obj.team === "object") {
    base.team = { ...base.team, ...obj.team };
  }
  if (obj.solution && typeof obj.solution === "object") {
    base.solution = { ...base.solution, ...obj.solution };
  }
  if (obj.report && typeof obj.report === "object") {
    base.report = { ...base.report, ...obj.report };
  }
  if (obj.blocks && typeof obj.blocks === "object") {
    for (const b of BLOCKS) {
      const loaded = (obj.blocks as Record<number, Partial<BlockState>>)[b.id];
      if (loaded && typeof loaded === "object") {
        base.blocks[b.id] = {
          ...emptyBlock(),
          ...loaded,
          fields: { ...(loaded.fields ?? {}) },
          promptDrafts: { ...(loaded.promptDrafts ?? {}) },
          messages: Array.isArray(loaded.messages) ? loaded.messages : [],
        };
      }
    }
  }
  return base;
}

export function loadState(): CanvasState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveState(state: CanvasState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or serialization failure — fail quietly; the in-memory state
    // and the downloadable Jump Script remain the source of truth.
  }
}

// ---- Jump Script (the team's working document) -----------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Download the entire canvas state as a Jump Script JSON file. */
export function exportJumpScript(state: CanvasState): void {
  const team = slugify(state.team.teamName) || "team";
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `carelab-jumpscript-${team}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Parse an uploaded Jump Script file into a normalized CanvasState. */
export function importJumpScript(file: File): Promise<CanvasState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(normalizeState(parsed));
      } catch {
        reject(new Error("That file isn’t a valid Jump Script (.json)."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsText(file);
  });
}
