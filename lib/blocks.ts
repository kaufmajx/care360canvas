import type { BlockKind, Phase } from "./types";

// ----------------------------------------------------------------------
// Single source of truth for the 12 canvas blocks.
//
// Learning text and prompts are taken VERBATIM from the CARELab reference
// documents ("CARE Canvas Block Prompts", "CARE Civic Impact Canvas").
// The only edits are: stripping stray leading backticks, removing one
// author-to-author aside in Block 7, and keeping "[ENTER ...]" tokens as
// editable fill-ins (the solution name is auto-substituted at send time).
// ----------------------------------------------------------------------

export interface InputField {
  id: string;
  label: string;
  placeholder?: string;
  /** Render as a single-line input instead of a textarea. */
  single?: boolean;
}

export interface PromptTemplate {
  id: string;
  /** Short label shown when a block offers more than one prompt. */
  label: string;
  text: string;
}

export interface BlockDef {
  id: number;
  phase: Phase;
  emoji: string;
  title: string;
  subtitle: string;
  kind: BlockKind;
  learning: string;
  /** Call-to-action line for input blocks (e.g. "Enter all CORE documents now"). */
  action?: string;
  inputFields?: InputField[];
  /** Optional callout shown under an input block. */
  tip?: string;
  prompts?: PromptTemplate[];
}

// ---- Phase metadata + Tailwind class map -----------------------------
// Class strings are written out in full so Tailwind's scanner picks them
// up (this file is included in tailwind.config content globs).
export interface PhaseStyle {
  label: string;
  emoji: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  lightBg: string;
  borderLight: string;
  ring: string;
}

export const PHASES: Phase[] = [
  "heartware",
  "mindware",
  "techware",
  "impact",
];

export const PHASE_STYLES: Record<Phase, PhaseStyle> = {
  heartware: {
    label: "HeartWare",
    emoji: "❤️",
    accentText: "text-heartware",
    accentBg: "bg-heartware",
    accentBorder: "border-heartware",
    lightBg: "bg-heartware-light",
    borderLight: "border-heartware-border",
    ring: "ring-heartware",
  },
  mindware: {
    label: "MindWare",
    emoji: "🔍",
    accentText: "text-mindware",
    accentBg: "bg-mindware",
    accentBorder: "border-mindware",
    lightBg: "bg-mindware-light",
    borderLight: "border-mindware-border",
    ring: "ring-mindware",
  },
  techware: {
    label: "TechWare / AI Unlock",
    emoji: "💡",
    accentText: "text-techware",
    accentBg: "bg-techware",
    accentBorder: "border-techware",
    lightBg: "bg-techware-light",
    borderLight: "border-techware-border",
    ring: "ring-techware",
  },
  impact: {
    label: "Impact",
    emoji: "🚀",
    accentText: "text-impact",
    accentBg: "bg-impact",
    accentBorder: "border-impact",
    lightBg: "bg-impact-light",
    borderLight: "border-impact-border",
    ring: "ring-impact",
  },
};

export const BLOCKS: BlockDef[] = [
  // ===================== ❤️ HeartWare =====================
  {
    id: 1,
    phase: "heartware",
    emoji: "❤️",
    title: "WHAT DO WE KNOW SO FAR?",
    subtitle: "CARE Criteria • Challenge Brief • Community Voices • Social Listening",
    kind: "input",
    action: "Enter all CORE documents now",
    learning:
      "Human-centered design is critical because the Mayor’s Challenge is not just a problem to solve; it is a community issue that affects real people with different needs, experiences, and hopes for the future. By beginning with strong foundation material, you will better understand the challenge, define the problem clearly, listen for stakeholder voices that may otherwise be missed, and recognize existing community solutions already working toward impact. This helps ensure your ideas are not created in isolation, but are thoughtful, respectful, and designed to build on community wisdom while creating more sustainable and evenhanded outcomes.",
    inputFields: [
      {
        id: "challengeBrief",
        label: "Mayor’s Challenge Brief",
        placeholder:
          "Paste your 1-page Mayor’s Challenge Brief — a summary of the problem you are solving.",
      },
      {
        id: "careCriteria",
        label: "CARE Criteria",
        placeholder:
          "Paste your CARE Criteria — your guiding north star ensuring the venture is values-driven.",
      },
      {
        id: "discoverySession",
        label: "Creative Discovery Session summary",
        placeholder: "Paste your 90-min Creative Discovery Session summary.",
      },
      {
        id: "actionPlan",
        label: "Cville Downtown Mall Action Plan",
        placeholder: "Paste the Cville Downtown Mall Action Plan (or relevant local plan).",
      },
      {
        id: "other",
        label: "Other core documents",
        placeholder:
          "Paste any other community voices, social listening, or core documents (TBD).",
      },
    ],
  },
  {
    id: 2,
    phase: "heartware",
    emoji: "❤️",
    title: "WHY DOES THIS MATTER?",
    subtitle: "Human story • values • Why now? • Desired future",
    kind: "input",
    action: "Enter your values and beliefs",
    learning:
      "The Mayor’s Challenge matters because it affects real people, real places, and the future we are helping shape as a community. Before designing a solution, your team needs to connect emotionally to the challenge by asking why it matters to you, why it feels urgent now, and what human experience you want to improve. As a team, identify the 2-3 values (e.g., belonging, stewardship) and beliefs (e.g., “a thriving downtown should feel like a shared home for all.”) that will guide your decisions. This foundation becomes your team’s compass: it keeps your work grounded in authentic care, stakeholder impact, and a clear purpose as you move from understanding the challenge to designing a meaningful community solution.",
    inputFields: [
      {
        id: "whyMatters",
        label: "Why does this matter to your team?",
        placeholder: "The human story — why this challenge matters to you.",
      },
      {
        id: "whyNow",
        label: "Why does it feel urgent now?",
        placeholder: "What makes this the right moment to act?",
      },
      {
        id: "humanExperience",
        label: "What human experience do you want to improve?",
        placeholder: "The lived experience you hope to change for the better.",
      },
      {
        id: "values",
        label: "Your 2–3 guiding values",
        placeholder: "e.g., belonging, stewardship",
      },
      {
        id: "beliefs",
        label: "Your guiding beliefs",
        placeholder:
          "e.g., “a thriving downtown should feel like a shared home for all.”",
      },
      {
        id: "desiredFuture",
        label: "Desired future",
        placeholder: "Your initial vision of the outcome you seek.",
      },
    ],
  },
  {
    id: 3,
    phase: "heartware",
    emoji: "❤️",
    title: "WHO IS IMPACTED?",
    subtitle: "Stakeholders • Needs • Perspectives • Missing voices",
    kind: "hybrid",
    action: "Map your stakeholders — then (optionally) ask AI to expand and challenge your thinking",
    learning:
      "Stakeholders are the people, groups, or organizations affected by a challenge, the current system, or a future solution — not just the people who may “use” the final idea. They can include people directly impacted, indirectly impacted, decision-makers, service providers, funders, partners, early adopters, and groups who may be overlooked or unintentionally harmed. Before designing, teams should understand whose lived experience matters, what are their pain points (what people are experiencing, feeling, or struggling with), who has influence, who might support the solution early, and who could be left out. This helps create solutions that are more human-centered, fair, practical, and sustainable for the whole community.",
    inputFields: [
      {
        id: "stakeholders",
        label: "Stakeholders — who is impacted?",
        placeholder:
          "Directly impacted, indirectly impacted, decision-makers, service providers, funders/partners, early adopters, and groups who may be overlooked or unintentionally harmed.",
      },
      {
        id: "needs",
        label: "Their needs & pain points",
        placeholder: "What people are experiencing, feeling, or struggling with.",
      },
      {
        id: "perspectives",
        label: "Perspectives & lived experience",
        placeholder: "Whose lived experience matters? Who has influence?",
      },
      {
        id: "missingVoices",
        label: "Missing voices",
        placeholder: "Who might be left out or unintentionally harmed?",
      },
      {
        id: "decisionCriteria",
        label: "Decision criteria (optional)",
        placeholder:
          "Pick 3–4: potential human impact • number of stakeholders affected • risk of unintended harm • feasibility for a small team • alignment with community voice • time horizon for impact.",
      },
    ],
    tip: "Define Your Decision Criteria — before using AI to prioritize, define what “impact” means for your team. If you skip this step, the AI will default to scale/efficiency — not necessarily CARE-aligned impact.",
    prompts: [
      {
        id: "stakeholders",
        label: "Stakeholder analysis",
        text: "You are the CARELab Civic Impact Canvas AI analyzing stakeholders associated with our team’s Mayor’s challenge. Use all core documents we have shared and research all other data you can find specific to our challenge to:\nIdentify the 4-5 key stakeholders who are impacted. Analyze people directly impacted, indirectly impacted, decision-makers, service providers, funders or partners, early adopters, and any groups that may be overlooked or unintentionally harmed.\nFor each key stakeholder group, identify their pain points and explain how they are affected, what they may need or care about, and what lived-experience insight should guide our thinking.\nIdentify 2–3 likely early adopter groups who may be motivated to support, try, or champion a future solution.\nKeep the response concise, human-centered, and grounded. Do not invent quotes, statistics, or sources. Output the answer in a summary paragraph and clear summary table.",
      },
    ],
  },

  // ===================== 🔍 MindWare =====================
  {
    id: 4,
    phase: "mindware",
    emoji: "🔍",
    title: "WHAT IS CAUSING IT?",
    subtitle: "Root causes • Systems • Friction points • Patterns",
    kind: "ai",
    learning:
      "Human-centered design begins by understanding what people actually experience before jumping to solutions. In addition to identifying stakeholder pain points (Block 4), you need to dig deeper. A friction point is something in the system that makes progress harder, slower, unfair, confusing, or discouraging. A root cause is the deeper reason the problem keeps happening, such as policies, incentives, behaviors, access gaps, resource limits, or system design. Identifying pain points, friction points, and root causes matters because strong solutions do not just treat symptoms; they address the deeper system conditions that create the problem, while reducing unintended harm and creating more sustainable impact.",
    prompts: [
      {
        id: "rootcauses",
        label: "Root-cause analysis",
        text: "You are the CARELab Civic Impact Canvas AI analyzing root causes. Using our BLOCK 4 Stakeholder work, apply systems thinking to identify:\nThe main friction points — where the current system creates barriers, confusion, delays, inequity, or repeated frustration\nThe root causes — underlying issues causing those pain points and friction points — including policies, incentives, behaviors, access gaps, resource limits, or system design factors\nSystemic factors, patterns, and feedback loops that keep the problem going\nPatterns that may have resisted previous solutions\nRisks of unintended harm if we define the problem too narrowly or design too quickly\nBe analytical but accessible. Use the CARE framework lens throughout.\n\nThen group the issues into 3–4 possible system domains and suggest which 1–2 domains may have the greatest potential for impact, using our decision criteria: CARE criteria, human impact, number of stakeholders affected, risk of unintended harm, feasibility, alignment with community voice.\nDo not invent quotes, statistics, organizations, or sources.\nPlease provide:\nA brief summary of the most important root-cause insights\nA concise table or bullet summary showing:\nStakeholder\nPain point\nFriction point\nUnderlying issue\nRoot cause\nCARE lens insight\nA short list of 3–4 system domains\nThe top 1–2 domains to consider, with key tradeoffs and one possible unintended consequence for each",
      },
    ],
  },
  {
    id: 5,
    phase: "mindware",
    emoji: "🔍",
    title: "WHAT IS CURRENT SOLUTION?",
    subtitle: "Current efforts • What’s working • Gaps • Opportunities",
    kind: "ai",
    learning:
      "Before creating a new solution, strong civic innovators first understand what the community is already doing. Most challenges are not being ignored; there are usually existing plans, organizations, programs, policies, or informal efforts already working on the issue. By studying the current solution landscape, teams can see what is working, where progress is happening, who is already trusted by the community, and where important gaps remain. This prevents teams from duplicating existing work, helps them build respectfully on community knowledge, and allows them to design a solution that complements, strengthens, or fills a real need.",
    prompts: [
      {
        id: "current",
        label: "Current solution landscape",
        text: "You are the CARELab Civic Impact Canvas AI mapping the current solution landscape using our core documents shared and all you can find from a deep search. Identify:\n- Existing programs, policies, and initiatives addressing this challenge and who is leading these\n- What is working well (and why)\n- Critical gaps and missed opportunities\n- Where community needs are unmet (which groups are currently benefiting and which groups may need more attention).\n- Suggest where a new solution could strengthen, connect, augment, or fill gaps in the current ecosystem without replacing or competing with existing work.\n\nBe balanced and evidence-informed. Do not invent organizations, statistics, quotes, or claims. Include source names or links when available.",
      },
    ],
  },
  {
    id: 6,
    phase: "mindware",
    emoji: "🔍",
    title: "WHAT IS WORKING ELSEWHERE?",
    subtitle: "Local • U.S. • Global examples • Lessons to adapt",
    kind: "ai",
    learning:
      "Benchmarking means studying real examples of solutions that are already working in other places so your team can learn from demonstrated success instead of starting from scratch. In innovation and social design, benchmarking is not copying another city’s idea exactly; it means looking at comparable communities, understanding what made a solution effective, and adapting the best insights to fit your local challenge, stakeholders, culture, resources, and CARE goals. This helps teams design more practical, credible, and impactful Charlottesville solutions by learning what has worked, what conditions made it possible, and what risks or limitations should be considered before adapting the idea.",
    prompts: [
      {
        id: "benchmark",
        label: "Benchmarking",
        text: "You are the CARELab Civic Impact Canvas AI helping our team benchmark solutions from other communities before we design our Charlottesville solution.\nUsing our selected system domain, uploaded documents, stakeholder insights, and credible public information, identify 3 examples from other U.S. cities or communities and 2 global examples that have addressed a similar challenge in a promising or successful way.\nPrioritize examples from cities or communities that are reasonably comparable to Charlottesville (size, demographics, downtown structure, university/community relationship, tourism, small business ecosystem, public space use, affordability pressures, environmental goals, public safety concerns, or civic identity).\nFor each benchmark example, analyze:\nCore Solution Idea\nWhat was the solution, program, policy, partnership, design intervention, or community initiative?\nCommunity Context\nWhy is this example relevant to Charlottesville? What similarities or differences should we notice?\nWhat Appears to Be Working\nWhat outcomes, signals of success, stakeholder benefits, or community improvements have been reported?\nConditions That Made It Work\nWhat enabled success — funding, policy, partnerships, leadership, community trust, business participation, design choices, volunteer capacity, university involvement, or cultural factors?\nLimitations, Risks, or Critiques\nWhat challenges, tradeoffs, equity concerns, unintended consequences, or implementation barriers should we learn from?\nAdaptation Insight for Charlottesville\nWhat could our team borrow, adapt, combine, or avoid as we design a solution for Charlottesville?\nDo not invent examples, statistics, quotes, or claims. Be analytical but accessible for high school and college students.\nOutput Format:\nStart with a brief summary of the strongest benchmarking insights. Then provide a concise table with these columns:\nCity / community\nSimilar challenge addressed\nCore solution\nWhy it is relevant to Charlottesville\nWhat is working\nConditions that made it work\nLimitations or risks\nCARE insight\nAdaptation idea for our team",
      },
    ],
  },

  // ===================== 💡 TechWare / AI Unlock =====================
  {
    id: 7,
    phase: "techware",
    emoji: "💡",
    title: "WHAT COULD WE CREATE?",
    subtitle: "Human Brainstorm • AI Unlock • Hybrid synthesis • Select strongest concept",
    kind: "ai",
    learning:
      "Now that your team has studied stakeholders, root causes, current solutions, and benchmarks, you are ready to begin imagining possible solutions. Brainstorming means generating several ideas quickly before deciding which one is best. At this stage, do not try to create the perfect solution right away. Explore bold, practical, human-centered possibilities that respond to real stakeholder needs, address root causes, complement what already exists, and align with the CARE Criteria. Your goal is to compare several promising directions, identify what is most feasible and meaningful, and shape one strong solution concept that could become a civic action plan.",
    prompts: [
      {
        id: "brainstorm",
        label: "Solution brainstorm",
        text: "You are the CARELab Civic Impact Canvas AI facilitating human-centered innovation brainstorming. Using all of the work we have done so far (including our selected system domain, stakeholder analysis, root-cause analysis, current solution research, benchmark examples) and our CARE Criteria guardrails, and team values, generate solution ideas that are bold and creative while staying grounded in real community needs.\nGenerate:\n- Human-centered brainstorm ideas (create 5-7 concepts)\n- Rank the top 3 strongest overall concept recommendations with rationale. Do not simply choose the most exciting idea; choose the ideas that best balance human impact, feasibility, differentiation, CARE alignment, and balance community stakeholder needs.\nFor each top idea, briefly explain:\nPractical solution pathways\nFor each idea, briefly explain whether it could become a pilot, partnership, service, campaign, event series, resource platform, community action plan, or other civic venture concept.\nRisks and tradeoffs\nFor each top idea, identify one possible implementation challenge, risk, or unintended consequence.\n\nBe bold and creative while staying grounded in community needs.\nOutput format: summary paragraph and concise table or bullet format for easy understanding including: solution idea, stakeholders served, root cause addressed, how works, why different, risks",
      },
    ],
  },
  {
    id: 8,
    phase: "techware",
    emoji: "💡",
    title: "HOW COULD AI HELP?",
    subtitle: "Access • Efficiency • Personalization • Prediction • Engagement",
    kind: "ai",
    learning:
      "After your team has created human-centered solution ideas, the next step is to ask how AI or technology could responsibly strengthen the solution. AI should not replace human judgment, lived experience, or community relationships. Instead, it can be used as an “unlock” to improve access, reduce friction, personalize support, identify patterns, amplify community voice, or help measure impact. In civic design, the most important question is not “Can we use AI?” but “Should we use AI, and how can it help people more fairly, safely, and effectively?” Your goal is to explore where AI could add meaningful value while protecting equity, privacy, trust, and human dignity.",
    prompts: [
      {
        id: "aiunlock",
        label: "AI unlock opportunities",
        text: "You are the CARELab Civic Impact Canvas AI exploring AI’s role in civic good. Analyze AI-enabled unlock opportunities (novel uses of AI/tech that could strengthen the top ideas shared in BLOCK 7) potential for:\n- ACCESS: Removing barriers to awareness, services, information and participation\n- EFFICIENCY: Reducing administrative burden and wait times\n- PERSONALIZATION: Tailoring support to different stakeholder needs\n- PREDICTION: Anticipating needs before they become crises\n- ENGAGEMENT: Building community participation and voice\n\nFor each top opportunity identified, share a possible “hybrid synthesis” combining AI unlock into the approach (explain where AI could bring value).\n\nAlways center evenhandedness and avoid AI harms. Share as summary and table or bullet format.",
      },
      {
        id: "solution",
        label: "Select & name our solution",
        text: "TEAM DECISION: Using all you know, discuss with team and select a SOLUTION that best addresses the Mayor’s Challenge.\n\nHere is our team’s selected solution [ENTER ALL INFO HERE]. Generate our SOLUTION as a clear concise 1 paragraph summary including all essential information so that we are able to analyze it further in BLOCK 9. From here out call our solution [ENTER NAME HERE].",
      },
    ],
  },
  {
    id: 9,
    phase: "techware",
    emoji: "💡",
    title: "WHO BENEFITS?",
    subtitle: "Applying CARE Criteria • Benefits • Risks • Missing stakeholders",
    kind: "ai",
    learning:
      "Once your team has shaped a possible solution, it is important to pause and ask: Who benefits, who might be burdened, and who may still be missing? Strong civic solutions should create value for the people most affected by the challenge, not just for the easiest-to-reach stakeholders. This block helps your team look honestly at the direct and indirect benefits of your idea, while also identifying risks, tradeoffs, unintended consequences, and missing voices. A thoughtful solution should be Conscious of lived experience, Accountable to stakeholder realities, Regenerative in how it supports long-term community well-being, and Evenhanded in how benefits and burdens are shared.",
    prompts: [
      {
        id: "benefits",
        label: "CARE benefits analysis",
        text: "You are the CARELab Civic Impact Canvas AI conducting a CARE benefits analysis. Our selected solution is [ENTER your solution name]. Using all of the work we have done so far — evaluate who benefits, who may be burdened, and who may be missing from our proposed solution.\nEvaluate applying the CARE Criteria:\n- Who directly benefits and how\n- Who indirectly benefits\n- Potential risks and unintended consequences\n- Missing stakeholders who should be included\n- Benefits and burdens fairly distributed",
      },
    ],
  },

  // ===================== 🚀 Impact =====================
  {
    id: 10,
    phase: "impact",
    emoji: "🚀",
    title: "MEASURING POSITIVE IMPACT",
    subtitle: "Short- & long-term impact • Responsible Performance Indicators (RPIs)",
    kind: "ai",
    learning:
      "In this block, your team will use Horizons360 Impact™ mapping to consider both short-term impact — what could change within about one year — and long-term impact — what could change over three or more years if the solution grows, improves, or inspires broader action. You will also identify Responsible Performance Indicators, which are practical ways to measure whether the solution is working in a CARE-aligned way. These measures should not only track numbers; they should help your team understand whether the solution is improving human experience, reducing harm, building trust, strengthening community capacity, and creating more evenhanded outcomes.",
    prompts: [
      {
        id: "horizons",
        label: "Impact horizons",
        text: "You are the CARELab Civic Impact Canvas AI evaluating future impact. Please evaluate impact across two time horizons:\nShort-Term Horizon: ~1 Year\nWhat meaningful changes could happen within the first year if this solution were piloted or launched? Consider early stakeholder benefits, behavior changes, access improvements, participation, trust-building, coordination, learning, and visible community outcomes.\nLong-Term Horizon: 3+ Years\nWhat deeper system changes could happen over three or more years if the solution is sustained, improved, partnered, or scaled? Consider long-term community resilience, stronger stakeholder networks, policy or practice change, reduced friction points, cultural shifts, economic vitality, environmental sustainability, and more evenhanded outcomes.\nOutput Format:\nStart with a brief summary paragraph explaining the most important short-term and long-term impact potential. Then provide a concise table with these columns:\nImpact area\nShort-term impact: ~1 year\nLong-term impact: 3+ years\nStakeholders affected\nCARE lens insight\nKey assumption\nRisk or concern\nEnd with the top 3 insights the team should carry into the summary report and ppt pitch.",
      },
      {
        id: "rpis",
        label: "Responsible Performance Indicators",
        text: "Create responsible performance indicators aligned with CARE:\nConscious Indicators\nHow could we measure whether people feel seen, heard, welcomed, respected, safer, more connected, or more supported?\nAccountable Indicators\nHow could we measure whether the solution is working responsibly, using evidence, stakeholder feedback, transparency, and clear learning loops?\nRegenerative Indicators\nHow could we measure whether the solution builds long-term capacity, resilience, sustainability, local participation, partnerships, or community renewal?\nEvenhanded Indicators\nHow could we measure whether benefits, access, participation, voice, and burdens are being shared fairly across different stakeholder groups?\nOutput Format:\nStart with a brief summary paragraph explaining what responsible performance should mean for this solution. Then provide a concise table with these columns:\nCARE principle\nResponsible performance indicator\nWhat it measures\nWhy it matters\nHow to measure it\nShort-term, long-term, or both\nRisk or caution\nEnd with 5 recommended priority indicators the team should include in the final pitch.",
      },
    ],
  },
  {
    id: 11,
    phase: "impact",
    emoji: "🚀",
    title: "THE FUTURE WE’RE CREATING",
    subtitle: "Vision • Value • Call to Action",
    kind: "ai",
    learning:
      "After your team has designed a solution, analyzed who benefits, and considered short- and long-term impact, your final step is to clearly communicate the future you are trying to create. A strong civic pitch does more than explain an idea; it helps people see why the idea matters, who it serves, what value it creates, and how others can help move it forward. In this block, your team will craft a clear vision, define the value your solution brings to stakeholders, and create a call to action that invites civic leaders, partners, businesses, nonprofits, or community members to support the next step.",
    prompts: [
      {
        id: "future",
        label: "Future vision",
        text: "You are the CARELab Civic Impact Canvas AI crafting the future vision. Using all of our work to this point, Articulate:\n- The immediate vision (1-2 years): what changes first\n- The medium-term vision (3-5 years): what transforms\n- The long-term horizon (10+ years): what becomes possible\n- The core value proposition for the community\n- A compelling call to action for different audiences\nMake this inspiring and specific.",
      },
    ],
  },
  {
    id: 12,
    phase: "impact",
    emoji: "🚀",
    title: "IMPACT DELIVERABLES",
    subtitle: "Executive Summary • Pitch Deck Script",
    kind: "ai",
    learning:
      "A strong solution only creates momentum if people can understand it, believe in it, and see how to support it. Communicating your work clearly is essential because civic leaders, partners, and community members need to quickly understand the challenge, the solution, the value created, and the action needed next. Strong communication uses storytelling to make the issue human, values to show why it matters, and a clear vision to help others see the future your team is trying to create. In this final block, your team will turn your research, design thinking, CARE analysis, and solution concept into practical deliverables that can be shared with real decision-makers.",
    prompts: [
      {
        id: "deliverables",
        label: "Impact deliverables",
        text: "You are the CARELab Civic Impact Canvas AI generating impact deliverables. Using our responsible performance indicators, vision, value, call to action, CARE Criteria guardrails, and team values — produce final communication materials that are immediately usable by our team.\nPlease create:\nEXECUTIVE SUMMARY\nWrite a polished, concise 1-page executive summary that clearly communicates the key elements of our civic solution. It should be compelling, credible, and appropriate for civic leaders, business leaders, community partners, funders, and residents.\nInclude:\nChallenge: Problem + urgency\nStakeholder Insight: Human need\nRoot Cause: Deeper issue\nCurrent Landscape: Existing efforts\nGaps: Unmet needs\nBenchmark Learning: Outside examples\nSolution: Proposed idea\nHow It Works: Simple steps\nAI/Technology Role, if relevant: Responsible support\nBenefits: Value created\nRisks/Missing Voices: Cautions + inclusion\nImpact Potential: Short + long term\nCARE Alignment: Conscious, Accountable, Regenerative, Evenhanded\nCall to Action: Next step\nThe executive summary should feel student-led, thoughtful, credible, and action-oriented. Use strong but realistic language. Do not overclaim impact, invent data, or add unsupported facts. Clearly separate what is known from what would need further validation.\nPITCH DECK OUTLINE\nCreate a 10-slide pitch deck outline with clear slide titles and key messages. The deck should tell a compelling story, not just list facts. It should follow the guidelines document we shared.",
      },
    ],
  },
];

export const BLOCK_BY_ID: Record<number, BlockDef> = Object.fromEntries(
  BLOCKS.map((b) => [b.id, b]),
);

export const FIRST_BLOCK = 1;
export const LAST_BLOCK = 12;

export function getBlock(id: number): BlockDef | undefined {
  return BLOCK_BY_ID[id];
}
