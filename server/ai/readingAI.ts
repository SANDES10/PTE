/**
 * Reading AI Scoring Engine — High-Accuracy Rebuild
 *
 * Architecture:
 *   1. ALL scoring is deterministic in TypeScript (no LLM for score calculation)
 *      → LLM is used ONLY for explanation generation and strategy coaching
 *   2. Chain-of-thought prompting for explanation quality
 *   3. Passage-grounded explanations: LLM must cite specific text evidence
 *   4. Distractor analysis: explains why wrong options are wrong
 *   5. Error classification: identifies the reading skill being tested
 *
 * Official sources:
 *   - Pearson PTE Academic Score Guide v21 (Nov 2024)
 *   - Pearson PTE Scoring Information for Teachers and Partners (2024)
 */

import { invokeLLM } from "../_core/llm";

// ─── Deterministic Scoring Utilities ─────────────────────────────────────────

function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
}

function answersMatch(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

function computePTEScore(rawScore: number, maxRawScore: number): number {
  if (maxRawScore === 0) return 10;
  const pte = Math.round(10 + (rawScore / maxRawScore) * 80);
  return Math.max(10, Math.min(90, pte));
}

function computeCEFR(pteScore: number): string {
  if (pteScore >= 85) return "C2";
  if (pteScore >= 76) return "C1";
  if (pteScore >= 59) return "B2";
  if (pteScore >= 43) return "B1";
  if (pteScore >= 29) return "A2";
  return "A1";
}

/**
 * Compute adjacent pair score for Re-order Paragraphs.
 * Official Pearson method: 1 point per correctly ordered consecutive pair.
 */
function computeAdjacentPairScore(correctOrder: string[], userOrder: string[]): number {
  let score = 0;
  // Build set of correct adjacent pairs
  const correctPairs = new Set<string>();
  for (let i = 0; i < correctOrder.length - 1; i++) {
    correctPairs.add(`${correctOrder[i]}|${correctOrder[i + 1]}`);
  }
  // Check user's adjacent pairs against correct pairs
  for (let i = 0; i < userOrder.length - 1; i++) {
    if (correctPairs.has(`${userOrder[i]}|${userOrder[i + 1]}`)) {
      score++;
    }
  }
  return score;
}

// ─── Official PTE Reading Scoring Rules ───────────────────────────────────────

const READING_SCORING_RULES = `
READING SCORING RULES — Official Pearson PTE Academic Score Guide v21 (Nov 2024)

Reading & Writing: Fill in the Blanks:
  Scoring: PARTIAL CREDIT — 1 point for each correctly completed blank.
  Minimum score: 0. No negative marking.
  Skills: Reading comprehension + vocabulary knowledge + collocation awareness.

Multiple Choice, Choose Multiple Answers:
  Scoring: PARTIAL CREDIT — +1 for each correct option selected, -1 for each incorrect option.
  Minimum score: 0 (cannot go below zero).
  Skills: Reading comprehension, identifying multiple correct statements.
  ⚠ NEGATIVE MARKING: Selecting wrong options REDUCES your score. Only select options you are confident about.

Re-order Paragraphs:
  Scoring: PARTIAL CREDIT — 1 point for each correctly ordered ADJACENT PAIR.
  Example: Correct=[A,B,C,D], User=[A,C,B,D]
    User pairs: (A,C), (C,B), (B,D)
    Correct pairs: (A,B), (B,C), (C,D)
    Matching pairs: none → score = 0
  Minimum score: 0.
  Skills: Text structure comprehension, discourse coherence.

Reading: Fill in the Blanks:
  Scoring: PARTIAL CREDIT — 1 point for each correctly completed blank.
  Minimum score: 0.
  Skills: Reading comprehension, vocabulary, grammar.

Multiple Choice, Choose Single Answer:
  Scoring: CORRECT/INCORRECT — 1 point if correct, 0 if incorrect.
  Skills: Reading comprehension, main idea, detail, inference.
`;

// ─── Reading Strategy Coaching ────────────────────────────────────────────────

const READING_STRATEGY_COACHING = `
READING STRATEGY COACHING BY TASK TYPE AND CEFR LEVEL

FILL IN THE BLANKS STRATEGIES:
  Step 1: Read the entire passage first to understand context.
  Step 2: For each blank, determine the grammatical category needed (noun/verb/adjective/adverb).
  Step 3: Check collocation: which word "goes with" the surrounding words naturally?
  Step 4: Check register: academic/formal text requires academic/formal vocabulary.
  Step 5: Eliminate options that don't fit grammatically, then choose the best semantic fit.
  Common traps: Words with similar meanings but different collocations (e.g., "make" vs "do").

MULTIPLE CHOICE SINGLE ANSWER STRATEGIES:
  Step 1: Read the question BEFORE reading the passage.
  Step 2: Identify the question type: main idea, specific detail, inference, vocabulary, author's purpose.
  Step 3: Locate the relevant section of the passage.
  Step 4: Eliminate obviously wrong options.
  Step 5: For remaining options, find direct evidence in the passage text.
  Common traps: Options that are true but don't answer the specific question asked.

MULTIPLE CHOICE MULTIPLE ANSWERS STRATEGIES:
  Step 1: Treat each option independently as true/false.
  Step 2: Find passage evidence for each option before selecting.
  Step 3: NEVER select an option just because it "sounds right" — negative marking applies.
  Step 4: If unsure about an option, leave it unselected (0 points better than -1).
  Common traps: Options that are partially true, options that contradict the passage.

RE-ORDER PARAGRAPHS STRATEGIES:
  Step 1: Find the INTRODUCTION paragraph (no pronoun reference to preceding text, introduces the topic).
  Step 2: Find the CONCLUSION paragraph (summarizes, uses "in conclusion/overall/therefore").
  Step 3: Look for pronoun references (he/she/it/they/this/these) — they must refer to something in the previous paragraph.
  Step 4: Look for discourse markers: "However", "Furthermore", "In addition", "As a result".
  Step 5: Look for time sequences, cause-effect relationships, and examples following claims.
  Common traps: Paragraphs that seem to fit in multiple positions.
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ReadingScoreResult {
  taskType: string;
  overallScore: number; // 10-90 PTE scale
  rawScore: number;
  maxRawScore: number;
  correctAnswers: string[];
  userAnswers: string[];
  explanation?: string; // Why each answer is correct/incorrect
  cefrLevel: string;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  strategyTips: string[];
  blankAnalysis?: Array<{
    blankNumber: number;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

// ─── Shared JSON Schema ───────────────────────────────────────────────────────

const BASE_READING_SCHEMA = {
  type: "object" as const,
  properties: {
    taskType: { type: "string" as const },
    overallScore: { type: "integer" as const },
    rawScore: { type: "integer" as const },
    maxRawScore: { type: "integer" as const },
    correctAnswers: { type: "array" as const, items: { type: "string" as const } },
    userAnswers: { type: "array" as const, items: { type: "string" as const } },
    explanation: { type: "string" as const },
    cefrLevel: { type: "string" as const },
    overallFeedback: { type: "string" as const },
    strengths: { type: "array" as const, items: { type: "string" as const } },
    improvements: { type: "array" as const, items: { type: "string" as const } },
    strategyTips: { type: "array" as const, items: { type: "string" as const } },
  },
  required: [
    "taskType", "overallScore", "rawScore", "maxRawScore",
    "correctAnswers", "userAnswers", "explanation", "cefrLevel",
    "overallFeedback", "strengths", "improvements", "strategyTips",
  ] as string[],
  additionalProperties: false as const,
};

// ─── Fill in the Blanks ───────────────────────────────────────────────────────

export async function scoreReadingFillBlanks(params: {
  passage: string;
  blanks: Array<{ position: number; correctAnswer: string; userAnswer: string; options: string[] }>;
  taskType: "reading_fill_blanks" | "reading_writing_fill_blanks";
}): Promise<ReadingScoreResult> {
  const { passage, blanks, taskType } = params;

  // Deterministic scoring
  const blankResults = blanks.map((b) => ({
    ...b,
    isCorrect: answersMatch(b.userAnswer, b.correctAnswer),
  }));
  const rawScore = blankResults.filter((b) => b.isCorrect).length;
  const maxRawScore = blanks.length;
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);

  const blankSummary = blankResults
    .map(
      (b, i) =>
        `Blank ${i + 1}: Correct="${b.correctAnswer}" | User="${b.userAnswer}" | Options=[${b.options.join(", ")}] | ${b.isCorrect ? "✓ CORRECT" : "✗ WRONG"}`
    )
    .join("\n");

  const incorrectBlanks = blankResults.filter((b) => !b.isCorrect);

  const prompt = `You are a certified PTE Academic examiner.
Analyze this Fill in the Blanks response with CHAIN-OF-THOUGHT reasoning.

═══ TASK INPUT ═══
TASK TYPE: ${taskType === "reading_writing_fill_blanks" ? "Reading & Writing: Fill in the Blanks" : "Reading: Fill in the Blanks"}
PASSAGE: "${passage}"

BLANK RESULTS (scores already computed — do NOT change them):
${blankSummary}

SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}, CEFR: ${cefrLevel})

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

═══ CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS ═══

STEP 1 — FOR EACH INCORRECT BLANK, ANALYZE:
  a) What grammatical category is needed at this position? (noun/verb/adj/adverb)
  b) What does the context tell us about the meaning needed?
  c) Why is "${incorrectBlanks.map((b) => b.correctAnswer).join('", "')}" the correct answer?
     - Cite the specific words in the passage that provide the context clue.
     - Explain the collocation pattern (what words naturally go together).
  d) Why is the user's answer wrong?
     - Is it the wrong grammatical category?
     - Is it semantically incorrect in this context?
     - Is it a common distractor trap?

STEP 2 — READING SKILL DIAGNOSIS:
  What reading skills does this task test? (vocabulary, collocation, grammar, context inference)
  What specific knowledge gap led to the incorrect answers?

STEP 3 — STRATEGY COACHING:
  Provide 2-3 specific, actionable tips for this exact passage and blank type.

Respond ONLY with valid JSON:`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON. Always cite specific passage text as evidence.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "fill_blanks_score",
        strict: true,
        schema: BASE_READING_SCHEMA,
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;

  // Override all scores with deterministic values
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = blanks.map((b) => b.correctAnswer);
  result.userAnswers = blanks.map((b) => b.userAnswer);

  // Add blank-level analysis
  result.blankAnalysis = blankResults.map((b, i) => ({
    blankNumber: i + 1,
    correctAnswer: b.correctAnswer,
    userAnswer: b.userAnswer,
    isCorrect: b.isCorrect,
    explanation: b.isCorrect ? "Correct answer selected." : `Incorrect. The correct answer is "${b.correctAnswer}".`,
  }));

  return result;
}

// ─── Multiple Choice Single Answer ───────────────────────────────────────────

export async function scoreMultipleChoiceSingle(params: {
  passage: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}): Promise<ReadingScoreResult> {
  const { passage, question, options, correctAnswer, userAnswer } = params;

  // Deterministic scoring
  const isCorrect = answersMatch(userAnswer, correctAnswer);
  const rawScore = isCorrect ? 1 : 0;
  const pteScore = isCorrect ? 90 : 10;
  const cefrLevel = computeCEFR(pteScore);

  const optionsList = options
    .map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`)
    .join("\n");

  const prompt = `You are a certified PTE Academic examiner.
Analyze this Multiple Choice (Single Answer) reading response with CHAIN-OF-THOUGHT reasoning.

═══ TASK INPUT ═══
PASSAGE: "${passage}"
QUESTION: "${question}"
OPTIONS:
${optionsList}
CORRECT ANSWER: "${correctAnswer}"
USER ANSWER: "${userAnswer}"
RESULT: ${isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

═══ CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS ═══

STEP 1 — QUESTION TYPE IDENTIFICATION:
  What reading skill does this question test?
  - Main idea / central theme
  - Specific detail / factual information
  - Inference / implied meaning
  - Vocabulary in context
  - Author's purpose / attitude / tone
  - Text structure / organization

STEP 2 — CORRECT ANSWER JUSTIFICATION:
  a) Find the specific sentence(s) in the passage that support the correct answer.
  b) Quote the relevant passage text directly.
  c) Explain the logical connection between the passage evidence and the correct answer.

STEP 3 — DISTRACTOR ANALYSIS (for each wrong option):
  a) Why is this option wrong?
  b) Is it: (i) contradicted by the passage, (ii) not mentioned, (iii) partially true but incomplete,
     (iv) true but doesn't answer the question, (v) a trap using passage keywords out of context?
  ${!isCorrect ? `d) The user chose "${userAnswer}" — what distractor trap did they fall into?` : ""}

STEP 4 — STRATEGY COACHING:
  What specific reading strategy would help with this question type?

Respond ONLY with valid JSON:`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step, cite passage evidence, then return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_single_score",
        strict: true,
        schema: BASE_READING_SCHEMA,
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;

  // Override scores with deterministic values
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = 1;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = [correctAnswer];
  result.userAnswers = [userAnswer];

  return result;
}

// ─── Multiple Choice Multiple Answers ────────────────────────────────────────

export async function scoreMultipleChoiceMultiple(params: {
  passage: string;
  question: string;
  options: string[];
  correctAnswers: string[];
  userAnswers: string[];
}): Promise<ReadingScoreResult> {
  const { passage, question, options, correctAnswers, userAnswers } = params;

  // Deterministic scoring: +1 correct, -1 incorrect, min 0
  let rawScore = 0;
  const correctSet = new Set(correctAnswers.map(normalizeAnswer));
  const userSet = new Set(userAnswers.map(normalizeAnswer));

  for (const ua of userAnswers) {
    if (correctSet.has(normalizeAnswer(ua))) {
      rawScore += 1;
    } else {
      rawScore -= 1;
    }
  }
  rawScore = Math.max(0, rawScore);
  const maxRawScore = correctAnswers.length;
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);

  // Classify each option
  const optionAnalysis = options.map((o, i) => {
    const isCorrectOption = correctSet.has(normalizeAnswer(o));
    const userSelected = userSet.has(normalizeAnswer(o));
    let status: string;
    if (isCorrectOption && userSelected) status = "✓ Correct — selected";
    else if (isCorrectOption && !userSelected) status = "✗ Correct — MISSED (should have selected)";
    else if (!isCorrectOption && userSelected) status = "✗ Wrong — SELECTED (cost -1 point)";
    else status = "✓ Wrong — not selected (correct decision)";
    return `${String.fromCharCode(65 + i)}) ${o} → ${status}`;
  });

  const prompt = `You are a certified PTE Academic examiner.
Analyze this Multiple Choice (Multiple Answers) reading response with CHAIN-OF-THOUGHT reasoning.

═══ TASK INPUT ═══
PASSAGE: "${passage}"
QUESTION: "${question}"
OPTION ANALYSIS:
${optionAnalysis.join("\n")}

SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}, CEFR: ${cefrLevel})
NEGATIVE MARKING: ${userAnswers.filter((ua) => !correctSet.has(normalizeAnswer(ua))).length} wrong selection(s) cost ${userAnswers.filter((ua) => !correctSet.has(normalizeAnswer(ua))).length} point(s).

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

═══ CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS ═══

STEP 1 — FOR EACH OPTION, PROVIDE PASSAGE-GROUNDED ANALYSIS:
  a) Is this option supported, contradicted, or not mentioned by the passage?
  b) Quote the specific passage text that confirms or denies this option.
  c) Explain why it is correct or incorrect.

STEP 2 — NEGATIVE MARKING ANALYSIS:
  Did the user incur negative marking penalties?
  What led them to select incorrect options?
  What distractor traps were present?

STEP 3 — STRATEGY COACHING:
  How should the user approach this question type to avoid negative marking?

Respond ONLY with valid JSON:`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step, cite passage evidence, then return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_multiple_score",
        strict: true,
        schema: BASE_READING_SCHEMA,
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;

  // Override scores
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = correctAnswers;
  result.userAnswers = userAnswers;

  return result;
}

// ─── Re-order Paragraphs ──────────────────────────────────────────────────────

export async function scoreReorderParagraphs(params: {
  paragraphs: Array<{ id: string; text: string }>;
  correctOrder: string[];
  userOrder: string[];
}): Promise<ReadingScoreResult> {
  const { paragraphs, correctOrder, userOrder } = params;

  // Deterministic adjacent pair scoring
  const rawScore = computeAdjacentPairScore(correctOrder, userOrder);
  const maxRawScore = Math.max(0, correctOrder.length - 1);
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);

  // Build pair analysis
  const correctPairs = new Set<string>();
  for (let i = 0; i < correctOrder.length - 1; i++) {
    correctPairs.add(`${correctOrder[i]}|${correctOrder[i + 1]}`);
  }

  const pairAnalysis = [];
  for (let i = 0; i < userOrder.length - 1; i++) {
    const pair = `${userOrder[i]}|${userOrder[i + 1]}`;
    pairAnalysis.push(`(${userOrder[i]}→${userOrder[i + 1]}): ${correctPairs.has(pair) ? "✓ CORRECT pair" : "✗ WRONG pair"}`);
  }

  const paragraphTexts = paragraphs
    .map((p) => `[${p.id}]: "${p.text.substring(0, 150)}${p.text.length > 150 ? "..." : ""}"`)
    .join("\n");

  const prompt = `You are a certified PTE Academic examiner.
Analyze this Re-order Paragraphs response with CHAIN-OF-THOUGHT reasoning.

═══ TASK INPUT ═══
PARAGRAPHS:
${paragraphTexts}

CORRECT ORDER: ${correctOrder.join(" → ")}
USER ORDER: ${userOrder.join(" → ")}

ADJACENT PAIR ANALYSIS:
${pairAnalysis.join("\n")}

SCORE: ${rawScore}/${maxRawScore} correct adjacent pairs (PTE: ${pteScore}, CEFR: ${cefrLevel})

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

═══ CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS ═══

STEP 1 — CORRECT ORDER JUSTIFICATION:
  For each consecutive pair in the CORRECT order, explain WHY they go together:
  a) What discourse marker or connector links them?
  b) What pronoun reference connects them? (e.g., "it", "this", "they" refers to something in the previous paragraph)
  c) What logical relationship exists? (cause→effect, claim→example, general→specific, chronological)
  d) Quote the specific words that create the link.

STEP 2 — USER ERROR ANALYSIS:
  For each WRONG pair in the user's order:
  a) Why did this pair seem plausible?
  b) What clue did the user miss that shows these paragraphs don't belong together?

STEP 3 — INTRODUCTION AND CONCLUSION IDENTIFICATION:
  Which paragraph is the introduction? (Look for: topic introduction, no pronoun references to preceding text)
  Which paragraph is the conclusion? (Look for: summary language, "in conclusion", "overall", "therefore")

STEP 4 — STRATEGY COACHING:
  Provide specific tips for this particular text.

Respond ONLY with valid JSON:`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step, cite specific text evidence, then return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "reorder_score",
        strict: true,
        schema: BASE_READING_SCHEMA,
      },
    },
  });

  const result = JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;

  // Override scores
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = correctOrder;
  result.userAnswers = userOrder;

  return result;
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function scoreReadingTask(params: {
  taskType: string;
  passage?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[];
  paragraphs?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  userOrder?: string[];
  blanks?: Array<{ position: number; correctAnswer: string; userAnswer: string; options: string[] }>;
}): Promise<ReadingScoreResult> {
  const { taskType } = params;

  switch (taskType) {
    case "reading_fill_blanks":
    case "reading_writing_fill_blanks":
      return scoreReadingFillBlanks({
        passage: params.passage || "",
        blanks: params.blanks || [],
        taskType: taskType as "reading_fill_blanks" | "reading_writing_fill_blanks",
      });

    case "multiple_choice_single":
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer:
          (Array.isArray(params.correctAnswer)
            ? params.correctAnswer[0]
            : params.correctAnswer) || "",
        userAnswer:
          (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });

    case "multiple_choice_multiple":
      return scoreMultipleChoiceMultiple({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswers: Array.isArray(params.correctAnswer)
          ? params.correctAnswer
          : [params.correctAnswer || ""],
        userAnswers: Array.isArray(params.userAnswer)
          ? params.userAnswer
          : [params.userAnswer || ""],
      });

    case "reorder_paragraphs":
      return scoreReorderParagraphs({
        paragraphs: params.paragraphs || [],
        correctOrder: params.correctOrder || [],
        userOrder: params.userOrder || [],
      });

    default:
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer:
          (Array.isArray(params.correctAnswer)
            ? params.correctAnswer[0]
            : params.correctAnswer) || "",
        userAnswer:
          (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });
  }
}
