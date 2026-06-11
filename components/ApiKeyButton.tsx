"use client";

import { useEffect, useState } from "react";
import { useCanvas } from "./CanvasProvider";

// Button + modal for the user's own Gemini API key. The key lives only in
// this browser (localStorage) and is sent directly to Google — never to us.
export function ApiKeyButton() {
  const { apiKey, setApiKey, hydrated } = useCanvas();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(apiKey);
      setReveal(false);
    }
  }, [open, apiKey]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hasKey = hydrated && apiKey.trim() !== "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-[#3a3a38] shadow-sm transition hover:bg-black/5"
        title={hasKey ? "API key is set" : "Add your Gemini API key"}
      >
        <span
          className={`h-2 w-2 rounded-full ${hasKey ? "bg-[#3D7A00]" : "bg-[#D85A30]"}`}
          aria-hidden
        />
        🔑 API key
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#2b2b29]">Your Gemini API key</h2>
            <p className="mt-2 text-sm text-black/60">
              This app talks to Google Gemini directly from your browser using your own free key.
              It’s stored only on this device and is never sent anywhere except Google. It is{" "}
              <span className="font-medium">not</span> included when you save a Jump Script.
            </p>
            <p className="mt-2 text-sm text-black/60">
              Get a free key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0E4A82] underline"
              >
                aistudio.google.com/apikey
              </a>
              .
            </p>

            <label className="mt-4 block text-sm font-semibold text-[#3a3a38]">API key</label>
            <div className="mt-1 flex gap-2">
              <input
                type={reveal ? "text" : "password"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="AIza…"
                autoFocus
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-black/30"
              />
              <button
                onClick={() => setReveal((r) => !r)}
                className="shrink-0 rounded-lg border border-black/15 bg-white px-3 text-sm text-[#3a3a38] hover:bg-black/5"
              >
                {reveal ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setApiKey("");
                  setOpen(false);
                }}
                className="text-sm text-black/50 underline-offset-2 hover:underline"
              >
                Clear key
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-[#3a3a38] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setApiKey(draft.trim());
                    setOpen(false);
                  }}
                  className="rounded-lg bg-[#3D7A00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
