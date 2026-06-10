import type { CanvasState } from "./types";
import { BLOCK_BY_ID, BLOCKS } from "./blocks";

const PERSONA = `You are the CARELab Civic Impact Canvas AI — a thinking partner for a student team designing a civic venture for the Mayor's Challenge in Charlottesville.

Operating principles:
- AI as Thinking Partner • Humans as Decision Makers. Your outputs are draft thinking, not final answers.
- Be grounded, human-centered, and accessible for students aged 18–25.
- Use the CARE lens throughout: Conscious (self-awareness, intention, empathy), Accountable (own outcomes, feedback loops), Regenerative (give back more than taken), Evenhanded (fair, balanced inclusion of all voices).
- Do NOT invent quotes, statistics, organizations, or sources. Clearly separate what is known from what would need further validation.
- Keep responses concise and well-structured. When a prompt asks for a table, use a Markdown table.`;

function truncate(s: string, max = 1600): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

/** Replace "[ENTER your solution name]" style tokens with the team's solution name. */
export function substituteSolution(text: string, solutionName: string): string {
  if (!solutionName.trim()) return text;
  return text
    .replace(/\[ENTER your solution name\]/gi, solutionName)
    .replace(/\[ENTER NAME HERE\]/gi, solutionName);
}

/**
 * Assemble the grounding context (team values, core documents, and the
 * work completed in earlier blocks) that the AI should "remember" when
 * helping with the current block. Returned as a system instruction.
 */
export function buildSystemContext(
  state: CanvasState,
  currentBlockId: number,
): string {
  const parts: string[] = [PERSONA];

  // Team identity
  const { members, teamName, projectName } = state.team;
  if (teamName || projectName || members) {
    const t: string[] = [];
    if (teamName) t.push(`Team: ${teamName}`);
    if (projectName) t.push(`Project: ${projectName}`);
    if (members) t.push(`Members: ${members}`);
    parts.push(`## Team\n${t.join("\n")}`);
  }

  // Block 1 — core documents
  const b1 = state.blocks[1];
  const coreFields = BLOCK_BY_ID[1].inputFields ?? [];
  const coreLines = coreFields
    .map((f) => {
      const v = (b1.fields[f.id] ?? "").trim();
      return v ? `### ${f.label}\n${truncate(v)}` : "";
    })
    .filter(Boolean);
  if (coreLines.length) {
    parts.push(`## Core documents (Block 1)\n${coreLines.join("\n\n")}`);
  }

  // Block 2 — values & beliefs
  const b2 = state.blocks[2];
  const valFields = BLOCK_BY_ID[2].inputFields ?? [];
  const valLines = valFields
    .map((f) => {
      const v = (b2.fields[f.id] ?? "").trim();
      return v ? `- ${f.label}: ${truncate(v, 400)}` : "";
    })
    .filter(Boolean);
  if (valLines.length) {
    parts.push(`## Why this matters — values & beliefs (Block 2)\n${valLines.join("\n")}`);
  }

  // Block 3 — stakeholders (input fields)
  const b3 = state.blocks[3];
  const skFields = BLOCK_BY_ID[3].inputFields ?? [];
  const skLines = skFields
    .map((f) => {
      const v = (b3.fields[f.id] ?? "").trim();
      return v ? `- ${f.label}: ${truncate(v, 500)}` : "";
    })
    .filter(Boolean);
  if (skLines.length) {
    parts.push(`## Stakeholders (Block 3, team input)\n${skLines.join("\n")}`);
  }

  // Selected solution
  if (state.solution.name || state.solution.summary) {
    const s: string[] = [];
    if (state.solution.name) s.push(`Name: ${state.solution.name}`);
    if (state.solution.summary) s.push(`Summary: ${truncate(state.solution.summary, 800)}`);
    parts.push(`## Selected solution\n${s.join("\n")}`);
  }

  // Completed work from earlier AI/hybrid blocks (final write-ups preferred,
  // otherwise the most recent AI answer).
  const priorBlocks = BLOCKS.filter(
    (b) => b.id < currentBlockId && b.kind !== "input",
  );
  const priorLines: string[] = [];
  for (const b of priorBlocks) {
    const bs = state.blocks[b.id];
    let summary = bs.finalWriteup.trim();
    if (!summary) {
      const lastAi = [...bs.messages].reverse().find((m) => m.role === "assistant");
      summary = lastAi ? lastAi.content.trim() : "";
    }
    if (summary) {
      priorLines.push(`### Block ${b.id}: ${b.title}\n${truncate(summary)}`);
    }
  }
  if (priorLines.length) {
    parts.push(`## Work completed in earlier blocks\n${priorLines.join("\n\n")}`);
  }

  const current = BLOCK_BY_ID[currentBlockId];
  parts.push(
    `## Current block\nWe are now working on Block ${current.id}: ${current.title} — ${current.subtitle}.`,
  );

  return parts.join("\n\n");
}

/**
 * The text that represents a block in the final report. Prefers the team's
 * curated write-up; otherwise composes from input fields; otherwise falls
 * back to the most recent AI answer. Used by the report builder.
 */
export function getBlockReportText(state: CanvasState, blockId: number): string {
  const bs = state.blocks[blockId];
  if (bs.finalWriteup.trim()) return bs.finalWriteup.trim();

  const def = BLOCK_BY_ID[blockId];
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
