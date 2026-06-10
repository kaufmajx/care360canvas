// ----------------------------------------------------------------------
// PRISM™ — translates CARE principles into AI practice.
// Each lens offers two ready-to-send "deepening" questions; teams can also
// ask their own follow-up freely (the chat box is always open).
// Questions are drafted from the lens definitions and are fully editable
// by the user before sending.
// ----------------------------------------------------------------------

export interface PrismLens {
  key: "P" | "R" | "I" | "S" | "M";
  name: string;
  tagline: string;
  questions: string[];
}

export const PRISM_LENSES: PrismLens[] = [
  {
    key: "P",
    name: "Purpose",
    tagline: "Set intention before acting",
    questions: [
      "Before we go further, what outcome are we really trying to create here, and for whom?",
      "What intention should guide this block so our work stays CARE-aligned and not just convenient?",
    ],
  },
  {
    key: "R",
    name: "Reflect",
    tagline: "Surface assumptions, biases, blind spots",
    questions: [
      "What assumptions are baked into this analysis, and whose perspective might we be missing?",
      "Where could our own biases or blind spots be shaping these conclusions?",
    ],
  },
  {
    key: "I",
    name: "Interrogate",
    tagline: "Explore tensions, implications, alternatives",
    questions: [
      "What tensions, tradeoffs, or unintended consequences haven’t we examined yet?",
      "What is a strong alternative interpretation or option we may have dismissed too quickly?",
    ],
  },
  {
    key: "S",
    name: "Synthesize",
    tagline: "Integrate insight into coherent options",
    questions: [
      "Pull the most important insights together into 2–3 coherent options we could carry forward.",
      "What is the clearest, most honest summary of what we now know in this block?",
    ],
  },
  {
    key: "M",
    name: "Measure",
    tagline: "Evaluate impact through the CARE lens",
    questions: [
      "Evaluate this through the CARE lens — is it Conscious, Accountable, Regenerative, and Evenhanded?",
      "How would we know if this is genuinely working for the stakeholders most affected?",
    ],
  },
];
