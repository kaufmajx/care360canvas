// ----------------------------------------------------------------------
// Shared types for the CARELab Civic Impact Canvas.
// All persistent state lives in localStorage under STORAGE_KEY and is
// shaped by CanvasState. A downloadable "Jump Script" is simply this same
// object serialized to JSON.
// ----------------------------------------------------------------------

export type Phase = "heartware" | "mindware" | "techware" | "impact";

// input  = human input only (Blocks 1, 2)
// hybrid = human input first, with an optional AI helper (Block 3)
// ai     = AI thinking-partner chat with editable prompt(s) (Blocks 4–12)
export type BlockKind = "input" | "hybrid" | "ai";

export type BlockStatus = "empty" | "draft" | "complete";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
  /** Marks a prompt that was sent as the editable block prompt (vs a follow-up). */
  kind?: "prompt" | "prism" | "freeform";
}

export interface BlockState {
  /** Values for human-input fields, keyed by InputField.id. */
  fields: Record<string, string>;
  /** Editable prompt drafts, keyed by PromptTemplate.id (falls back to default text). */
  promptDrafts: Record<string, string>;
  /** The running AI conversation for this block. */
  messages: ChatMessage[];
  /** The synthesized write-up the team selects to carry into the report. */
  finalWriteup: string;
  status: BlockStatus;
}

export interface TeamInfo {
  members: string;
  teamName: string;
  projectName: string;
}

export interface ReportState {
  /** Optional pasted PowerPoint pitch guidelines (Block 12 references these). */
  pitchGuidelines: string;
  executiveSummary: string;
  pitchDeck: string;
  generatedAt: string | null;
}

export interface CanvasState {
  version: 1;
  schema: "carelab_canvas_v1";
  team: TeamInfo;
  /** Captured around Block 8; used to fill "[ENTER your solution name]" in later prompts. */
  solution: { name: string; summary: string };
  /** Block id (1–12) -> state. */
  blocks: Record<number, BlockState>;
  report: ReportState;
  updatedAt: string;
}
