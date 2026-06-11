"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  BlockState,
  CanvasState,
  ChatMessage,
  ReportState,
  TeamInfo,
} from "@/lib/types";
import {
  createDefaultState,
  loadApiKey,
  loadState,
  saveApiKey,
  saveState,
} from "@/lib/storage";

interface CanvasContextValue {
  state: CanvasState;
  hydrated: boolean;
  /** The user's Gemini API key (browser-only; never part of the Jump Script). */
  apiKey: string;
  setApiKey: (key: string) => void;
  setTeam: (patch: Partial<TeamInfo>) => void;
  setSolution: (patch: Partial<CanvasState["solution"]>) => void;
  setReport: (patch: Partial<ReportState>) => void;
  updateBlock: (id: number, patch: Partial<BlockState>) => void;
  setBlockField: (id: number, fieldId: string, value: string) => void;
  setPromptDraft: (id: number, promptId: string, value: string) => void;
  addMessage: (id: number, msg: ChatMessage) => void;
  clearMessages: (id: number) => void;
  setFinalWriteup: (id: number, text: string) => void;
  setBlockStatus: (id: number, status: BlockState["status"]) => void;
  replaceState: (next: CanvasState) => void;
  resetAll: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CanvasState>(() => createDefaultState());
  const [apiKey, setApiKeyState] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage once, on the client only.
  useEffect(() => {
    const stored = loadState();
    if (stored) setState(stored);
    setApiKeyState(loadApiKey());
    setHydrated(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    saveApiKey(key);
  }, []);

  // Debounced persistence whenever state changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  // Central mutator: stamps updatedAt on every change.
  const mutate = useCallback((fn: (s: CanvasState) => CanvasState) => {
    setState((prev) => ({ ...fn(prev), updatedAt: new Date().toISOString() }));
  }, []);

  const setTeam = useCallback(
    (patch: Partial<TeamInfo>) =>
      mutate((s) => ({ ...s, team: { ...s.team, ...patch } })),
    [mutate],
  );

  const setSolution = useCallback(
    (patch: Partial<CanvasState["solution"]>) =>
      mutate((s) => ({ ...s, solution: { ...s.solution, ...patch } })),
    [mutate],
  );

  const setReport = useCallback(
    (patch: Partial<ReportState>) =>
      mutate((s) => ({ ...s, report: { ...s.report, ...patch } })),
    [mutate],
  );

  const patchBlock = useCallback(
    (id: number, fn: (b: BlockState) => BlockState) =>
      mutate((s) => ({
        ...s,
        blocks: { ...s.blocks, [id]: fn(s.blocks[id]) },
      })),
    [mutate],
  );

  const updateBlock = useCallback(
    (id: number, patch: Partial<BlockState>) =>
      patchBlock(id, (b) => ({ ...b, ...patch })),
    [patchBlock],
  );

  const setBlockField = useCallback(
    (id: number, fieldId: string, value: string) =>
      patchBlock(id, (b) => ({
        ...b,
        fields: { ...b.fields, [fieldId]: value },
        status: b.status === "empty" ? "draft" : b.status,
      })),
    [patchBlock],
  );

  const setPromptDraft = useCallback(
    (id: number, promptId: string, value: string) =>
      patchBlock(id, (b) => ({
        ...b,
        promptDrafts: { ...b.promptDrafts, [promptId]: value },
      })),
    [patchBlock],
  );

  const addMessage = useCallback(
    (id: number, msg: ChatMessage) =>
      patchBlock(id, (b) => ({
        ...b,
        messages: [...b.messages, msg],
        status: b.status === "empty" ? "draft" : b.status,
      })),
    [patchBlock],
  );

  const clearMessages = useCallback(
    (id: number) => patchBlock(id, (b) => ({ ...b, messages: [] })),
    [patchBlock],
  );

  const setFinalWriteup = useCallback(
    (id: number, text: string) =>
      patchBlock(id, (b) => ({ ...b, finalWriteup: text })),
    [patchBlock],
  );

  const setBlockStatus = useCallback(
    (id: number, status: BlockState["status"]) =>
      patchBlock(id, (b) => ({ ...b, status })),
    [patchBlock],
  );

  const replaceState = useCallback((next: CanvasState) => {
    setState({ ...next, updatedAt: new Date().toISOString() });
  }, []);

  const resetAll = useCallback(() => {
    setState(createDefaultState());
  }, []);

  const value: CanvasContextValue = {
    state,
    hydrated,
    apiKey,
    setApiKey,
    setTeam,
    setSolution,
    setReport,
    updateBlock,
    setBlockField,
    setPromptDraft,
    addMessage,
    clearMessages,
    setFinalWriteup,
    setBlockStatus,
    replaceState,
    resetAll,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within a CanvasProvider");
  return ctx;
}
