/**
 * Writing AI Scoring Engine — High-Accuracy Rebuild
 *
 * Architecture:
 *   1. Deterministic pre-processing in TypeScript (word count, sentence count, spelling check,
 *      paragraph count, transition word detection) → hard facts passed to LLM
 *   2. Chain-of-thought prompting → criterion-by-criterion reasoning before scoring
 *   3. Gatekeeper rules enforced in TypeScript (Form=0 → total=0; Content=0 → total=0)
 *   4. 6-level calibration anchors with REAL machine scores from Pearson Score Guide v21
 *   5. Strict JSON schema enforcement
 *
 * Official sources:
 *   - Pearson PTE Academic Score Guide v21 (Nov 2024)
 *   - Pearson PTE Scoring Information for Teachers and Partners (2024)
 */

import { invokeLLM } from "../_core/llm";

// ─── Deterministic Pre-Processing Utilities ───────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  // Count sentence-ending punctuation
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase();
}

function countSpellingErrors(text: string): { count: number; examples: string[] } {
  // Common PTE test-taker spelling errors (deterministic check for known patterns)
  const commonErrors: Record<string, string> = {
    "recieve": "receive",
    "beleive": "believe",
    "occured": "occurred",
    "seperate": "separate",
    "definately": "definitely",
    "accomodate": "accommodate",
    "goverment": "government",
    "enviroment": "environment",
    "developement": "development",
    "independance": "independence",
    "existance": "existence",
    "occurance": "occurrence",
    "knowlege": "knowledge",
    "arguement": "argument",
    "judgement": "judgment",
    "maintainance": "maintenance",
    "neccessary": "necessary",
    "priviledge": "privilege",
    "publically": "publicly",
    "rythm": "rhythm",
    "succesful": "successful",
    "tommorrow": "tomorrow",
    "untill": "until",
    "wierd": "weird",
    "writting": "writing",
    "comming": "coming",
    "begining": "beginning",
    "grammer": "grammar",
    "alot": "a lot",
    "alright": "all right",
    "basicly": "basically",
    "concious": "conscious",
    "critisism": "criticism",
    "dissapear": "disappear",
    "embarass": "embarrass",
    "foriegn": "foreign",
    "harrass": "harass",
    "liase": "liaise",
    "millenium": "millennium",
    "miniscule": "minuscule",
    "noticable": "noticeable",
    "occassion": "occasion",
    "perseverence": "perseverance",
    "pronounciation": "pronunciation",
    "questionaire": "questionnaire",
    "relevent": "relevant",
    "restaraunt": "restaurant",
    "sieze": "seize",
    "supercede": "supersede",
    "temperament": "temperament",
    "vaccum": "vacuum",
    "wether": "whether",
  };

  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  const errors: string[] = [];

  for (const word of words) {
    if (commonErrors[word] && !errors.includes(word)) {
      errors.push(word);
    }
  }

  return { count: errors.length, examples: errors.slice(0, 5) };
}

function detectTransitionWords(text: string): number {
  const transitions = [
    "however", "furthermore", "moreover", "therefore", "consequently",
    "in addition", "on the other hand", "in contrast", "for example",
    "for instance", "in conclusion", "to summarize", "as a result",
    "nevertheless", "although", "despite", "while", "whereas",
    "first", "second", "third", "finally", "additionally",
    "in fact", "indeed", "similarly", "likewise", "thus",
  ];
  const lower = text.toLowerCase();
  return transitions.filter((t) => lower.includes(t)).length;
}

function detectComplexSentences(text: string): number {
  // Count subordinating conjunctions as proxy for complex sentences
  const subordinators = [
    "although", "because", "since", "while", "whereas", "if", "unless",
    "when", "after", "before", "until", "as", "that", "which", "who",
    "whose", "where", "whether", "even though", "provided that",
  ];
  const lower = text.toLowerCase();
  return subordinators.filter((s) => lower.includes(s)).length;
}

// ─── Official PTE Writing Rubrics (verbatim from Score Guide v21) ─────────────

const SUMMARIZE_WRITTEN_TEXT_RUBRIC = `
SUMMARIZE WRITTEN TEXT — OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

FORM (0-2) — CHECK THIS FIRST:
  Score 2: Written in ONE, single, complete sentence. Word count 5-75.
  Score 0: NOT written in one single complete sentence, OR fewer than 5 words, OR more than 75 words,
           OR written in capital letters.
  ⚠ GATEKEEPER: If Form = 0, ALL other scores = 0 and total = 0.

CONTENT (0-2):
  Score 2: Provides a GOOD summary. ALL relevant aspects mentioned.
  Score 1: Provides a FAIR summary but misses ONE or TWO aspects.
  Score 0: OMITS or MISREPRESENTS the main aspects of the text.

GRAMMAR (0-2):
  Score 2: Has CORRECT grammatical structure throughout.
  Score 1: Contains grammatical errors but with NO HINDRANCE to communication.
  Score 0: Has DEFECTIVE grammatical structure which COULD HINDER communication.

VOCABULARY (0-2):
  Score 2: Has APPROPRIATE choice of words throughout.
  Score 1: Contains lexical errors but with NO HINDRANCE to communication.
  Score 0: Has DEFECTIVE word choice which COULD HINDER communication.

Maximum raw score: 8 points (Form 2 + Content 2 + Grammar 2 + Vocabulary 2).
PTE scale: round(10 + (rawScore/8) × 80)

DECISION RULES:
- Single sentence check: count full stops, question marks, exclamation marks → must be exactly 1
- Word count: must be 5-75 words
- If either fails → Form = 0, total = 0
`;

const WRITE_ESSAY_RUBRIC = `
WRITE ESSAY — OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

CONTENT (0-3) — CHECK THIS FIRST:
  Score 3: ADEQUATELY deals with the prompt. All aspects addressed.
  Score 2: Deals with the prompt but does NOT deal with ONE minor aspect.
  Score 1: Deals with the prompt but OMITS a major aspect or more than one minor aspect.
  Score 0: Does NOT deal properly with the prompt. Includes significant pre-prepared/memorized material.
  ⚠ GATEKEEPER: If Content = 0, ALL other scores = 0 and total = 0.

FORM (0-2) — CHECK THIS SECOND:
  Score 2: Length is between 200 and 300 words.
  Score 1: Length is between 120-199 OR 301-380 words.
  Score 0: Length is LESS THAN 120 OR MORE THAN 380 words. Written in capital letters.
           Contains no punctuation. Only consists of bullet points or very short sentences.
  ⚠ GATEKEEPER: If Form = 0, ALL other scores = 0 and total = 0.

DEVELOPMENT, STRUCTURE AND COHERENCE (0-2):
  Score 2: Shows GOOD development and LOGICAL structure. Well-organized paragraphs.
           Appropriate use of discourse markers and transitions.
  Score 1: Is incidentally less well structured; some elements or paragraphs are poorly linked.
  Score 0: LACKS coherence and mainly consists of lists or loose elements.

GRAMMAR (0-2):
  Score 2: Shows CONSISTENT grammatical control of COMPLEX language. Errors are RARE and difficult to spot.
  Score 1: Shows a relatively HIGH DEGREE of grammatical control. No mistakes leading to misunderstandings.
  Score 0: Contains MAINLY SIMPLE structures and/or SEVERAL BASIC mistakes.

GENERAL LINGUISTIC RANGE (0-2):
  Score 2: Exhibits MASTERY of a wide range of language. Formulates thoughts precisely.
           No sign that the test taker is restricted in expression.
  Score 1: SUFFICIENT range to provide clear descriptions, express viewpoints and develop arguments.
  Score 0: Contains MAINLY BASIC language and lacks precision.

VOCABULARY RANGE (0-2):
  Score 2: Good command of a BROAD lexical repertoire, idiomatic expressions and colloquialisms.
           Aware of connotative significance of words.
  Score 1: Shows a GOOD RANGE of vocabulary for general academic topics.
           Lexical shortcomings lead to circumlocution or some imprecision.
  Score 0: Contains MAINLY BASIC vocabulary insufficient to deal with the topic at the required level.

SPELLING (0-2):
  Score 2: CORRECT spelling throughout (zero errors).
  Score 1: EXACTLY ONE spelling error.
  Score 0: MORE THAN ONE spelling error.

Maximum raw score: 15 points.
PTE scale: round(10 + (rawScore/15) × 80)
`;

// ─── Calibration Anchors (Real machine scores from Pearson Score Guide v21) ───

const WRITING_CALIBRATION_ANCHORS = `
MULTI-LEVEL CALIBRATION ANCHORS — Real machine scores from Pearson Score Guide v21 (Nov 2024)

These are ACTUAL machine scores from the official Pearson scoring engine.
Use these as your PRIMARY reference when assigning scores.

═══════════════════════════════════════════════════════════════
WRITE ESSAY — Official Pearson Calibration (Tobacco/Health topic)
═══════════════════════════════════════════════════════════════

C1 Level (PTE 76-84) — ACTUAL MACHINE SCORES:
  Content: 2.74/3, DSC: 1.97/2, Form: 2.00/2, GLR: 2.00/2, Grammar: 1.70/2, Spelling: 1.00/2, Vocab: 1.82/2
  Total: 13.23/15 → PTE ~80
  Characteristics: "Clear, well-structured exposition. Points of view given at some length with
    subsidiary points. Reasons and relevant examples demonstrated. General linguistic range and
    vocabulary range are excellent. Phrasing and word choice are appropriate. Very few grammar errors.
    Spelling is excellent."
  → Grammar: 2 (rare errors), GLR: 2 (no restrictions), Vocab: 2 (broad repertoire), DSC: 2 (good structure)

B2 Level (PTE 59-75) — ACTUAL MACHINE SCORES:
  Content: 2.25/3, DSC: 1.17/2, Form: 2.00/2, GLR: 1.42/2, Grammar: 1.68/2, Spelling: 0.00/2, Vocab: 1.32/2
  Total: 9.84/15 → PTE ~62
  Characteristics: "A systematic argument with appropriate highlighting of significant points and
    relevant supporting detail. Ability to evaluate different ideas demonstrated. However, some
    obvious grammar errors and inappropriate use of vocabulary. Quite a number of spelling errors."
  → Grammar: 1 (some obvious errors), GLR: 1 (sufficient but imprecise), Spelling: 0 (multiple errors)

B1 Level (PTE 43-58) — ACTUAL MACHINE SCORES:
  Content: 1.80/3, DSC: 1.35/2, Form: 2.00/2, GLR: 1.03/2, Grammar: 1.07/2, Spelling: 0.00/2, Vocab: 0.93/2
  Total: 8.18/15 → PTE ~54
  Characteristics: "A simple essay which gives a minimal answer to the prompt. The argument
    contains insufficient supporting ideas. The structure is lacking in logic and coherence.
    There is frequent misuse of grammar and vocabulary. Vocabulary range is limited and
    inappropriate at times."
  → Content: 1-2 (minimal answer), DSC: 1 (lacking coherence), Grammar: 1 (frequent misuse)

A2 Level (PTE 29-42) — Estimated scores:
  Content: 0-1, DSC: 0, Form: 1-2, GLR: 0, Grammar: 0, Spelling: 0, Vocab: 0
  Total: 1-3/15 → PTE ~18-26
  Characteristics: "Does not properly address the prompt. Very superficial treatment.
    No coherent structure. Many basic grammar mistakes. Basic vocabulary only."

═══════════════════════════════════════════════════════════════
SUMMARIZE WRITTEN TEXT — Official Pearson Calibration
═══════════════════════════════════════════════════════════════

C1 Level (PTE 76-84):
  Form: 2 (single sentence, 20-50 words), Content: 2 (all main points), Grammar: 2, Vocab: 2
  Total: 8/8 → PTE 90
  Example: "The passage discusses [main topic], explaining that [key point 1] and [key point 2],
    while also noting that [key point 3], which has implications for [conclusion]."

B2 Level (PTE 59-75):
  Form: 2, Content: 1 (misses 1-2 aspects), Grammar: 2, Vocab: 1
  Total: 6/8 → PTE ~70
  Example: Covers main topic but omits secondary points; some imprecise word choices.

B1 Level (PTE 43-58):
  Form: 2, Content: 1 (fair summary), Grammar: 1 (minor errors), Vocab: 1
  Total: 5/8 → PTE ~60
  Example: Covers some aspects, grammatical errors that don't impede understanding.

A2 Level (PTE 29-42):
  Form: 0 (two sentences or too long), or Form: 2 with Content: 0
  Total: 0/8 → PTE 10
  Example: Two separate sentences, or completely misses the main point.
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface WritingScoreResult {
  taskType: string;
  overallScore: number;
  rawScore: number;
  maxRawScore: number;
  traits: {
    content: { score: number; maxScore: number; feedback: string };
    form: { score: number; maxScore: number; feedback: string };
    grammar: { score: number; maxScore: number; feedback: string };
    vocabulary: { score: number; maxScore: number; feedback: string };
    development?: { score: number; maxScore: number; feedback: string };
    linguisticRange?: { score: number; maxScore: number; feedback: string };
    spelling?: { score: number; maxScore: number; feedback: string };
  };
  wordCount: number;
  cefrLevel: string;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer?: string;
  grammarErrors?: string[];
  vocabularyFeedback?: string;
}

// ─── Summarize Written Text ───────────────────────────────────────────────────

export async function scoreSummarizeWrittenText(params: {
  sourceText: string;
  response: string;
}): Promise<WritingScoreResult> {
  const { sourceText, response } = params;

  // Deterministic pre-processing
  const wordCount = countWords(response);
  const sentenceCount = countSentences(response);
  const allCaps = isAllCaps(response);
  const spellingCheck = countSpellingErrors(response);

  // Deterministic Form check
  const formScore = (sentenceCount === 1 && wordCount >= 5 && wordCount <= 75 && !allCaps) ? 2 : 0;

  const preProcessing = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Word count: ${wordCount} (valid range: 5-75)
  Sentence count: ${sentenceCount} (must be exactly 1)
  All capitals: ${allCaps ? "YES — automatic Form=0" : "NO"}
  Detected spelling errors: ${spellingCheck.count} (${spellingCheck.examples.join(", ") || "none detected"})
  FORM SCORE (FIXED): ${formScore}/2
    ${formScore === 0 ? "⚠ FORM=0: " + (sentenceCount !== 1 ? `${sentenceCount} sentences detected (must be 1)` : wordCount < 5 ? "Too short (<5 words)" : wordCount > 75 ? "Too long (>75 words)" : "Written in capitals") : "✓ Single sentence, valid word count"}
  ${formScore === 0 ? "⚠ GATEKEEPER TRIGGERED: All scores = 0, total = 0" : ""}
`;

  // If Form=0, return immediately with all zeros
  if (formScore === 0) {
    const formFeedback =
      sentenceCount !== 1
        ? `Response contains ${sentenceCount} sentences. Must be exactly ONE complete sentence.`
        : wordCount < 5
        ? `Response is too short (${wordCount} words). Must be 5-75 words.`
        : wordCount > 75
        ? `Response is too long (${wordCount} words). Must be 5-75 words.`
        : "Response is written in all capitals, which is not accepted.";

    return {
      taskType: "summarize_written_text",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 8,
      wordCount,
      traits: {
        form: { score: 0, maxScore: 2, feedback: formFeedback },
        content: { score: 0, maxScore: 2, feedback: "Form requirement not met — content not scored." },
        grammar: { score: 0, maxScore: 2, feedback: "Form requirement not met — grammar not scored." },
        vocabulary: { score: 0, maxScore: 2, feedback: "Form requirement not met — vocabulary not scored." },
      },
      cefrLevel: "A1",
      overallFeedback: `Your response does not meet the Form requirement: ${formFeedback} In PTE, a Summarize Written Text response MUST be a single complete sentence between 5 and 75 words.`,
      strengths: [],
      improvements: [
        "Write your summary as exactly ONE complete sentence.",
        `Your response has ${wordCount} words and ${sentenceCount} sentence(s). Aim for a single sentence of 25-50 words.`,
        "Use a complex sentence structure: 'The passage discusses X, explaining that Y, while also noting Z.'",
      ],
      modelAnswer: `The text explores [main topic], arguing that [key point 1] and [key point 2], which suggests that [conclusion].`,
      grammarErrors: [],
      vocabularyFeedback: "Not scored due to Form failure.",
    };
  }

  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Summarize Written Text response using CHAIN-OF-THOUGHT reasoning.

═══ TASK INPUT ═══
SOURCE TEXT: "${sourceText}"
TEST TAKER RESPONSE: "${response}"

${preProcessing}

${SUMMARIZE_WRITTEN_TEXT_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}

═══ CHAIN-OF-THOUGHT SCORING INSTRUCTIONS ═══
Note: Form score is already FIXED at ${formScore}/2 by the pre-processor. Do NOT change it.

STEP 1 — CONTENT ANALYSIS:
  a) Identify the 3-5 main points of the source text.
  b) Check which main points appear in the response.
  c) Is the main topic/argument captured?
  d) Are any key aspects omitted or misrepresented?
  e) Assign content score: 2 (all aspects), 1 (misses 1-2), 0 (omits/misrepresents main aspects).

STEP 2 — GRAMMAR ANALYSIS:
  a) Identify any grammatical errors in the response.
  b) Do the errors hinder communication?
  c) Assign grammar score: 2 (correct), 1 (errors but no hindrance), 0 (defective, hinders communication).

STEP 3 — VOCABULARY ANALYSIS:
  a) Are the words appropriate for the topic?
  b) Are there any inappropriate or incorrect word choices?
  c) Assign vocabulary score: 2 (appropriate throughout), 1 (errors but no hindrance), 0 (defective).

STEP 4 — RAW SCORE CALCULATION:
  raw = Form(${formScore}) + Content + Grammar + Vocabulary (max 8)
  PTE = round(10 + (raw/8) × 80), clamped to [10, 90]

STEP 5 — CEFR: 10-28→A1, 29-42→A2, 43-58→B1, 59-75→B2, 76-84→C1, 85-90→C2

STEP 6 — FEEDBACK:
  - List the main points of the source text.
  - Identify which were covered and which were missed.
  - Provide a C1-level model one-sentence summary.

Respond ONLY with valid JSON:`;

  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "swt_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            rawScore: { type: "integer" },
            maxRawScore: { type: "integer" },
            wordCount: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                form: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                content: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                grammar: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                vocabulary: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
              },
              required: ["form", "content", "grammar", "vocabulary"],
              additionalProperties: false,
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" },
          },
          required: [
            "taskType", "overallScore", "rawScore", "maxRawScore", "wordCount",
            "traits", "cefrLevel", "overallFeedback", "strengths", "improvements",
            "grammarErrors", "vocabularyFeedback", "modelAnswer",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const result = JSON.parse(response_llm.choices[0].message.content as string) as WritingScoreResult;

  // Override form score with deterministic value
  if (result.traits.form) {
    result.traits.form.score = formScore;
    result.traits.form.maxScore = 2;
  }

  // Recalculate raw score and PTE score with fixed form
  const rawScore =
    formScore +
    (result.traits.content?.score || 0) +
    (result.traits.grammar?.score || 0) +
    (result.traits.vocabulary?.score || 0);
  result.rawScore = rawScore;
  result.overallScore = Math.round(10 + (rawScore / 8) * 80);
  result.overallScore = Math.max(10, Math.min(90, result.overallScore));

  return result;
}

// ─── Write Essay ──────────────────────────────────────────────────────────────

export async function scoreWriteEssay(params: {
  prompt: string;
  response: string;
}): Promise<WritingScoreResult> {
  const { prompt: essayPrompt, response } = params;

  // Deterministic pre-processing
  const wordCount = countWords(response);
  const sentenceCount = countSentences(response);
  const paragraphCount = countParagraphs(response);
  const allCaps = isAllCaps(response);
  const spellingCheck = countSpellingErrors(response);
  const transitionCount = detectTransitionWords(response);
  const complexSentenceCount = detectComplexSentences(response);

  // Deterministic Form score
  let formScore: number;
  let formFeedback: string;
  if (allCaps || wordCount < 120 || wordCount > 380) {
    formScore = 0;
    formFeedback = allCaps
      ? "Essay written in all capitals — not accepted."
      : wordCount < 120
      ? `Too short: ${wordCount} words. Minimum is 120 words (ideal: 200-300).`
      : `Too long: ${wordCount} words. Maximum is 380 words (ideal: 200-300).`;
  } else if (wordCount >= 200 && wordCount <= 300) {
    formScore = 2;
    formFeedback = `Word count: ${wordCount} words — within the ideal 200-300 range.`;
  } else {
    formScore = 1;
    formFeedback = `Word count: ${wordCount} words — acceptable but outside the ideal 200-300 range.`;
  }

  // Deterministic Spelling score
  let spellingScore: number;
  if (spellingCheck.count === 0) spellingScore = 2;
  else if (spellingCheck.count === 1) spellingScore = 1;
  else spellingScore = 0;

  const preProcessing = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Word count: ${wordCount}
  Sentence count: ${sentenceCount}
  Paragraph count: ${paragraphCount}
  All capitals: ${allCaps ? "YES" : "NO"}
  Transition words detected: ${transitionCount} (${transitionCount >= 5 ? "good" : transitionCount >= 3 ? "adequate" : "limited"})
  Complex sentence structures: ${complexSentenceCount}
  Spelling errors detected: ${spellingCheck.count} (${spellingCheck.examples.join(", ") || "none"})
  FORM SCORE (FIXED): ${formScore}/2 — ${formFeedback}
  SPELLING SCORE (FIXED): ${spellingScore}/2 — ${spellingCheck.count} error(s) found
  ${formScore === 0 ? "⚠ FORM GATEKEEPER: All scores = 0" : ""}
`;

  // If Form=0, return immediately with all zeros
  if (formScore === 0) {
    return {
      taskType: "write_essay",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 15,
      wordCount,
      traits: {
        content: { score: 0, maxScore: 3, feedback: "Form requirement not met." },
        form: { score: 0, maxScore: 2, feedback: formFeedback },
        grammar: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        vocabulary: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        development: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        linguisticRange: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        spelling: { score: spellingScore, maxScore: 2, feedback: formFeedback },
      },
      cefrLevel: "A1",
      overallFeedback: `Your essay does not meet the Form requirement: ${formFeedback} In PTE, essays must be 120-380 words (ideal: 200-300).`,
      strengths: [],
      improvements: [
        `Your essay is ${wordCount} words. Aim for 200-300 words.`,
        "Structure your essay with an introduction, 2-3 body paragraphs, and a conclusion.",
        "Each paragraph should have a clear topic sentence and supporting evidence.",
      ],
      grammarErrors: [],
      vocabularyFeedback: "Not scored due to Form failure.",
    };
  }

  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Write Essay response using CHAIN-OF-THOUGHT reasoning, criterion by criterion.

═══ TASK INPUT ═══
ESSAY PROMPT: "${essayPrompt}"
TEST TAKER ESSAY: "${response}"

${preProcessing}

${WRITE_ESSAY_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}

═══ CHAIN-OF-THOUGHT SCORING INSTRUCTIONS ═══
Note: Form score is FIXED at ${formScore}/2 and Spelling score is FIXED at ${spellingScore}/2. Do NOT change them.

STEP 1 — CONTENT ANALYSIS (most important criterion):
  a) What does the prompt ask the test taker to discuss/argue?
  b) Does the response address ALL aspects of the prompt?
  c) Are there specific aspects that are missing or underdeveloped?
  d) Is there any pre-prepared/memorized content that is off-topic?
  e) Assign content score: 3 (fully addresses), 2 (misses one minor aspect),
     1 (omits major aspect), 0 (does not deal properly with prompt).
  ⚠ If Content = 0, ALL other scores = 0 and total = 0.

STEP 2 — DEVELOPMENT, STRUCTURE AND COHERENCE:
  a) Does the essay have a clear introduction, body paragraphs, and conclusion?
  b) Are paragraphs well-organized with topic sentences?
  c) Are transitions used effectively? (detected: ${transitionCount})
  d) Is the argument logically developed?
  e) Assign DSC score: 2 (good development), 1 (some weak links), 0 (lacks coherence).

STEP 3 — GRAMMAR ANALYSIS:
  a) Identify specific grammatical errors (subject-verb agreement, tense, articles, prepositions).
  b) Do errors hinder communication?
  c) Are complex sentence structures used? (detected: ${complexSentenceCount})
  d) Assign grammar score: 2 (consistent control, rare errors), 1 (high degree of control, no misunderstandings), 0 (mainly simple, several basic mistakes).

STEP 4 — GENERAL LINGUISTIC RANGE:
  a) Does the test taker use a wide range of language structures?
  b) Are they restricted in how they express ideas?
  c) Assign GLR score: 2 (mastery, no restrictions), 1 (sufficient range), 0 (mainly basic).

STEP 5 — VOCABULARY RANGE:
  a) Is academic vocabulary used appropriately?
  b) Are there inappropriate word choices or circumlocution?
  c) Assign vocabulary score: 2 (broad repertoire), 1 (good range, some imprecision), 0 (mainly basic).

STEP 6 — RAW SCORE:
  raw = Content + Form(${formScore}) + DSC + Grammar + GLR + Vocab + Spelling(${spellingScore}) (max 15)
  PTE = round(10 + (raw/15) × 80), clamped to [10, 90]

STEP 7 — CEFR: 10-28→A1, 29-42→A2, 43-58→B1, 59-75→B2, 76-84→C1, 85-90→C2

STEP 8 — FEEDBACK:
  - List specific grammar errors with corrections.
  - Suggest better vocabulary alternatives.
  - Provide the opening paragraph of a C1-level model essay.

Respond ONLY with valid JSON:`;

  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a certified PTE Academic examiner. Reason step by step criterion by criterion, then return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "essay_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            rawScore: { type: "integer" },
            maxRawScore: { type: "integer" },
            wordCount: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                form: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                development: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                grammar: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                linguisticRange: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                vocabulary: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
                spelling: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false,
                },
              },
              required: ["content", "form", "development", "grammar", "linguisticRange", "vocabulary", "spelling"],
              additionalProperties: false,
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" },
          },
          required: [
            "taskType", "overallScore", "rawScore", "maxRawScore", "wordCount",
            "traits", "cefrLevel", "overallFeedback", "strengths", "improvements",
            "grammarErrors", "vocabularyFeedback", "modelAnswer",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const result = JSON.parse(response_llm.choices[0].message.content as string) as WritingScoreResult;

  // Override form and spelling scores with deterministic values
  if (result.traits.form) {
    result.traits.form.score = formScore;
    result.traits.form.maxScore = 2;
    result.traits.form.feedback = formFeedback;
  }
  if (result.traits.spelling) {
    result.traits.spelling.score = spellingScore;
    result.traits.spelling.maxScore = 2;
    if (spellingCheck.examples.length > 0) {
      result.traits.spelling.feedback = `${spellingCheck.count} spelling error(s) detected: ${spellingCheck.examples.join(", ")}.`;
    }
  }

  // If Content=0, zero out everything
  const contentScore = result.traits.content?.score || 0;
  if (contentScore === 0) {
    result.overallScore = 10;
    result.rawScore = 0;
    Object.keys(result.traits).forEach((key) => {
      const trait = result.traits[key as keyof typeof result.traits];
      if (trait && key !== "content" && key !== "form") {
        trait.score = 0;
      }
    });
    return result;
  }

  // Recalculate raw score with fixed form and spelling
  const rawScore =
    contentScore +
    formScore +
    (result.traits.development?.score || 0) +
    (result.traits.grammar?.score || 0) +
    (result.traits.linguisticRange?.score || 0) +
    (result.traits.vocabulary?.score || 0) +
    spellingScore;

  result.rawScore = rawScore;
  result.overallScore = Math.round(10 + (rawScore / 15) * 80);
  result.overallScore = Math.max(10, Math.min(90, result.overallScore));

  // Set CEFR based on final score
  if (result.overallScore >= 85) result.cefrLevel = "C2";
  else if (result.overallScore >= 76) result.cefrLevel = "C1";
  else if (result.overallScore >= 59) result.cefrLevel = "B2";
  else if (result.overallScore >= 43) result.cefrLevel = "B1";
  else if (result.overallScore >= 29) result.cefrLevel = "A2";
  else result.cefrLevel = "A1";

  return result;
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function scoreWritingTask(params: {
  taskType: string;
  sourceText?: string;
  prompt?: string;
  response: string;
}): Promise<WritingScoreResult> {
  switch (params.taskType) {
    case "summarize_written_text":
      return scoreSummarizeWrittenText({
        sourceText: params.sourceText || params.prompt || "",
        response: params.response,
      });
    case "write_essay":
      return scoreWriteEssay({
        prompt: params.prompt || params.sourceText || "",
        response: params.response,
      });
    default:
      return scoreWriteEssay({
        prompt: params.prompt || "",
        response: params.response,
      });
  }
}
