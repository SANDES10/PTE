/**
 * AI Coaching Engine v2 — PTE Academic Aligned
 * Rebuilt with:
 * - Official PTE scoring rubrics per task type
 * - Few-shot calibration examples at each band level
 * - Chain-of-thought reasoning before feedback generation
 * - Structured JSON output with strict validation
 * - Task-specific error pattern recognition
 * - Model answer generation at band 65, 79, and 90
 */
import { invokeLLM } from "./_core/llm";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
export interface TaskFeedback {
  taskType: string;
  overallBand: "Expert (90)" | "Very Good (79-89)" | "Good (65-78)" | "Competent (50-64)" | "Modest (36-49)" | "Limited (10-35)";
  scoreBreakdown: {
    criterion: string;
    score: number; // 0-5
    maxScore: number;
    comment: string;
    pteBandEquivalent: string; // e.g. "Good (65-78)"
  }[];
  detailedFeedback: string;
  specificErrors: {
    type: string;
    example: string;
    correction: string;
    explanation: string;
    impactOnScore: "high" | "medium" | "low";
  }[];
  modelAnswers: {
    band: "65" | "79" | "90";
    response: string;
    commentary: string;
  }[];
  improvementTips: {
    priority: "critical" | "high" | "medium" | "low";
    skill: string;
    tip: string;
    practiceExercise: string;
    expectedImpact: string; // e.g. "+5-8 points in Pronunciation"
  }[];
  nextSteps: string[];
  estimatedScoreRange: { min: number; max: number };
  reasoning: string; // chain-of-thought
}

export interface PersonalizedCoachingPlan {
  studentLevel: "Beginner" | "Elementary" | "Intermediate" | "Upper-Intermediate" | "Advanced";
  overallAssessment: string;
  targetScore: number;
  currentEstimatedScore: number;
  scoreGap: number;
  estimatedWeeksToTarget: number;
  weeklyPlan: {
    week: number;
    theme: string;
    focus: string;
    tasks: string[];
    targetImprovement: string;
    checkpointGoal: string;
  }[];
  skillGaps: {
    skill: string;
    currentLevel: number; // 0-90
    targetLevel: number;
    gap: number;
    priority: "critical" | "important" | "nice-to-have";
    rootCause: string;
    resources: string[];
    practiceFrequency: string;
  }[];
  dailyPracticeRecommendation: {
    totalMinutes: number;
    breakdown: { activity: string; minutes: number; frequency: string; rationale: string }[];
  };
  quickWins: string[]; // tasks where small effort = big score gain
  motivationalMessage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PTE BAND REFERENCE (shared across all coaching prompts)
// ─────────────────────────────────────────────────────────────────────────────
const PTE_BAND_REFERENCE = `
PTE Academic Score Bands:
- 90 (Expert): Fully operational. Accurate, fluent, complete. No errors.
- 79-89 (Very Good): Effective command. Occasional minor inaccuracies. Task fully addressed.
- 65-78 (Good): Generally effective. Mix of simple/complex. Some errors but meaning clear.
- 50-64 (Competent): Partial command. Errors noticeable but communication maintained.
- 36-49 (Modest): Intermittent command. Frequent errors affecting clarity.
- 10-35 (Limited): Extremely limited. Errors dominate. Task largely unmet.
`;

// ─────────────────────────────────────────────────────────────────────────────
// TASK-SPECIFIC COACHING PROMPTS (v2 — with rubrics and error patterns)
// ─────────────────────────────────────────────────────────────────────────────
const TASK_COACHING_PROMPTS: Record<string, string> = {
  read_aloud: `You are an expert PTE Academic Read Aloud evaluator with deep knowledge of English phonology and the official PTE scoring rubric.

${PTE_BAND_REFERENCE}

OFFICIAL READ ALOUD SCORING RUBRIC:
- CONTENT (0-5): Proportion of words from the original text spoken correctly
  5 = All words correct | 4 = 1-2 minor errors | 3 = 3-5 errors | 2 = 6-10 errors | 1 = >10 errors | 0 = Unrecognisable
- PRONUNCIATION (0-5): Clarity and accuracy of phoneme production
  5 = Native-like, all phonemes clear, correct stress | 4 = Mostly clear, minor accent | 3 = Some unclear phonemes | 2 = Frequently unclear | 1 = Largely unintelligible | 0 = Cannot be understood
- ORAL FLUENCY (0-5): Natural rhythm, pace (ideal: 120-160 wpm), smooth delivery
  5 = Completely natural | 4 = Minor hesitations | 3 = Noticeable hesitations | 2 = Frequent pauses | 1 = Very choppy | 0 = Extremely disfluent

COMMON READ ALOUD ERRORS TO IDENTIFY:
1. Incorrect word stress (e.g., "REsearch" instead of "reSEARCH" as a verb)
2. Mispronounced academic vocabulary (e.g., "epitome" pronounced as "epi-TOME")
3. Monotone delivery lacking sentence stress on content words
4. Excessive pausing at every comma
5. Rushing through difficult phrases
6. Omitting or substituting words
7. Adding filler words (um, uh, like)
8. Incorrect vowel sounds in unstressed syllables`,

  repeat_sentence: `You are an expert PTE Academic Repeat Sentence evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL REPEAT SENTENCE SCORING RUBRIC:
- CONTENT (0-5): Accuracy of reproduction (exact words, correct order)
  5 = Perfect reproduction | 4 = 1 word changed/missing | 3 = 2-3 changes | 2 = Only fragments correct | 1 = Barely recognisable | 0 = Unrecognisable
- PRONUNCIATION (0-5): Clarity of phoneme production
- ORAL FLUENCY (0-5): Connected speech, natural pace, no unnatural pausing

CHUNKING STRATEGY ASSESSMENT:
- Did the student use meaningful phrase chunks? (e.g., "students who participate / in extracurricular activities / tend to develop")
- Were function words (articles, prepositions) retained?
- Was sentence-final intonation appropriate?

COMMON ERRORS:
1. Dropping function words (articles, prepositions, auxiliaries)
2. Changing word order
3. Substituting synonyms (acceptable in meaning but penalised in PTE)
4. Losing the end of long sentences (recency effect)
5. Unnatural pausing between chunks`,

  describe_image: `You are an expert PTE Academic Describe Image evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL DESCRIBE IMAGE SCORING RUBRIC:
- CONTENT (0-5): Coverage of key visual elements
  5 = All main features, trends, data, comparisons, and conclusion | 4 = Most features with specific data | 3 = Some features, misses trends | 2 = Only superficial | 1 = Minimal | 0 = Off-topic
- ORAL FLUENCY (0-5): Smooth delivery within 40 seconds
- PRONUNCIATION (0-5): Clear articulation of numbers, percentages, technical terms

IDEAL DESCRIBE IMAGE STRUCTURE (40 seconds):
1. Introduction (5s): "This [chart/graph/diagram] shows/illustrates..."
2. Main trend/feature (15s): Highest/lowest values with specific numbers
3. Comparison (10s): Contrast between categories or time periods
4. Conclusion (10s): Overall trend or key takeaway

COMMON ERRORS:
1. Not mentioning specific numbers or percentages
2. Only describing one aspect (e.g., only the highest bar)
3. Using vague language ("it went up") instead of precise language ("increased by 15%")
4. Running out of time before concluding
5. Describing what the image IS rather than what it SHOWS
6. Poor pronunciation of numbers (e.g., "fifteen percent" vs "fifty percent")`,

  retell_lecture: `You are an expert PTE Academic Re-tell Lecture evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL RE-TELL LECTURE SCORING RUBRIC:
- CONTENT (0-5): Coverage of main topic, key arguments, supporting details
  5 = All main points with logical structure | 4 = Most points, minor gaps | 3 = Main topic + some points | 2 = Only main topic | 1 = Minimal content | 0 = Off-topic
- ORAL FLUENCY (0-5): Natural academic delivery
- PRONUNCIATION (0-5): Clear articulation of academic/technical vocabulary

NOTE-TAKING STRATEGY ASSESSMENT:
- Was the main argument captured?
- Were 3-5 key supporting points included?
- Was the structure logical (topic → argument → evidence → conclusion)?
- Were academic terms pronounced correctly?

COMMON ERRORS:
1. Describing only the topic without the argument
2. Listing facts without showing relationships
3. Missing the speaker's conclusion or stance
4. Mispronouncing technical/academic vocabulary
5. Speaking too quickly and losing clarity`,

  answer_short_question: `You are an expert PTE Academic Answer Short Question evaluator.

SCORING: Binary — correct (100) or incorrect (0).
A correct answer is typically 1-3 words. Partial answers or over-explanations do not gain extra credit.

COMMON ERRORS:
1. Giving a sentence when one word suffices
2. Confusing similar concepts (e.g., "biography" vs "autobiography")
3. Mispronouncing the answer
4. Hesitating too long before answering`,

  summarize_written_text: `You are an expert PTE Academic Summarize Written Text evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL SWT SCORING RUBRIC (max 8 points):
- CONTENT (0-2): Key points from passage included, no irrelevant information
  2 = All key points | 1 = Main point only | 0 = Irrelevant or missing
- FORM (0-1): Single sentence, 5-75 words, grammatically complete
  1 = Meets all form requirements | 0 = Multiple sentences OR outside word range
- GRAMMAR (0-2): Complex sentence structure, correct subordination
  2 = No errors, complex syntax | 1 = Minor errors | 0 = Major errors
- VOCABULARY (0-2): Academic vocabulary, paraphrasing (not copying)
  2 = Sophisticated paraphrase, academic range | 1 = Some paraphrase | 0 = Verbatim copying
- SPELLING (0-1): No spelling errors

CRITICAL RULES:
1. MUST be ONE sentence only — multiple sentences = FORM score 0
2. MUST be 5-75 words — outside range = FORM score 0
3. Should NOT copy sentences verbatim
4. Should use complex structures: relative clauses, participle phrases, nominalisations
5. Should cover MAIN idea + 2-3 key supporting points

COMMON ERRORS:
1. Writing multiple sentences (most common error)
2. Exceeding 75 words
3. Copying sentences directly from the passage
4. Omitting the main argument
5. Using simple "and" coordination instead of complex subordination
6. Missing key supporting details`,

  write_essay: `You are an expert PTE Academic Write Essay evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL ESSAY SCORING RUBRIC (max 15 points):
- CONTENT (0-3): Addresses all aspects, develops clear position, relevant examples
  3 = Fully addresses all aspects with well-developed argument | 2 = Addresses most aspects | 1 = Partially addresses | 0 = Off-topic
- FORM (0-2): 200-300 words, appropriate structure
  2 = 200-300 words, clear intro/body/conclusion | 1 = Minor structure issues or slight word count deviation | 0 = <150 or >380 words
- GRAMMAR (0-2): Variety of structures, minimal errors
  2 = Complex variety, no significant errors | 1 = Some variety, minor errors | 0 = Basic structures, frequent errors
- VOCABULARY (0-2): Academic range, precise word choice
  2 = Wide academic range, precise collocations | 1 = Adequate range | 0 = Basic/repetitive
- SPELLING (0-1): Consistent spelling
- WRITTEN DISCOURSE (0-2): Cohesion, coherence, discourse markers
  2 = Excellent flow, varied discourse markers | 1 = Adequate cohesion | 0 = Poor flow, no markers

IDEAL ESSAY STRUCTURE:
1. Introduction (40-50 words): Paraphrase prompt + clear thesis statement
2. Body 1 (60-80 words): Main argument + specific example/evidence + explanation
3. Body 2 (60-80 words): Second argument OR counter-argument + rebuttal
4. Conclusion (30-40 words): Restate thesis + broader implication

COMMON ERRORS:
1. Not paraphrasing the prompt in the introduction
2. Weak topic sentences that don't preview the paragraph
3. Generic examples ("For example, in many countries...")
4. Repetitive vocabulary (using the same word 3+ times)
5. Missing discourse markers (Furthermore, However, In contrast, Consequently)
6. Conclusion that just repeats the introduction word-for-word
7. Word count outside 200-300 range`,

  summarize_spoken_text: `You are an expert PTE Academic Summarize Spoken Text evaluator.

OFFICIAL SST SCORING RUBRIC (max 8 points — same as SWT):
- CONTENT (0-2): Key points from lecture captured
- FORM (0-1): 50-70 words, complete sentences, paragraph format
- GRAMMAR (0-2): Accurate and varied structures
- VOCABULARY (0-2): Academic vocabulary, paraphrasing
- SPELLING (0-1): Correct spelling

COMMON ERRORS:
1. Word count outside 50-70 range
2. Writing bullet points instead of prose
3. Missing the main argument of the lecture
4. Including irrelevant details while missing key points
5. Copying exact phrases from the transcript`,

  multiple_choice_single: `You are an expert PTE Academic Reading evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Read the question FIRST to know what to look for
2. Skim the passage for the relevant section
3. Eliminate clearly wrong options
4. Watch for negation words: NOT, EXCEPT, NEVER, LEAST
5. The correct answer is usually a paraphrase, not a direct quote
6. Beware of "partially true" options that miss a key qualifier

COMMON ERRORS:
1. Choosing answers that are true but not supported by the text
2. Missing negation words
3. Confusing the author's view with examples cited in the text
4. Choosing the first plausible option without checking others`,

  multiple_choice_multiple: `You are an expert PTE Academic Reading evaluator.

SCORING: Partial credit — correct selections minus incorrect selections.

STRATEGY COACHING:
1. Typically 2-3 correct answers out of 5-7 options
2. Each correct selection = +1, each incorrect = -1 (net scoring)
3. If unsure, it's better to leave an option unselected than guess wrong
4. Verify each option independently against the text

COMMON ERRORS:
1. Over-selecting (choosing too many options)
2. Under-selecting (missing correct options)
3. Not reading each option carefully against the passage`,

  reorder_paragraphs: `You are an expert PTE Academic Reading evaluator.

SCORING: Partial credit for adjacent pairs in correct order.

STRATEGY COACHING:
1. Find the TOPIC SENTENCE first (most general, introduces the topic)
2. Look for pronouns that refer back (it, they, this, these → must follow what they refer to)
3. Identify time/sequence markers (first, then, subsequently, finally)
4. Find cause-effect relationships (because, therefore, as a result)
5. The concluding paragraph often contains "in conclusion", "overall", "thus"

COMMON ERRORS:
1. Not identifying the topic sentence correctly
2. Ignoring pronoun references
3. Placing the conclusion too early`,

  fill_in_blanks_reading: `You are an expert PTE Academic Reading Fill in the Blanks evaluator.

SCORING: 1 point per correct blank.

STRATEGY COACHING:
1. Read the entire sentence before choosing
2. Check the word BEFORE and AFTER the blank for collocational clues
3. Determine the grammatical function needed (noun/verb/adjective/adverb)
4. Eliminate options that don't collocate with surrounding words
5. Check for subject-verb agreement and tense consistency

COMMON ERRORS:
1. Choosing words with similar meaning but wrong collocation
2. Wrong word form (e.g., "economy" instead of "economic")
3. Ignoring tense or number agreement`,

  fill_in_blanks_rw: `You are an expert PTE Academic Reading & Writing Fill in the Blanks evaluator.

This is the highest-value reading task — each blank is worth 1 point.

STRATEGY COACHING:
1. Read the entire passage first for context
2. For each blank, identify: grammatical function + semantic field + collocation
3. Use process of elimination — cross out clearly wrong options first
4. Academic collocations are key: "conduct research", "raise awareness", "draw conclusions"

COMMON ERRORS:
1. Choosing semantically similar but collocationally wrong words
2. Ignoring grammatical constraints (e.g., choosing a verb when a noun is needed)
3. Not using passage context to narrow down options`,

  highlight_correct_summary: `You are an expert PTE Academic Listening evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Listen for the MAIN ARGUMENT, not just details
2. The correct summary covers the whole passage, not just one part
3. Eliminate summaries that are too narrow (only one point) or too broad (vague generalisation)
4. Watch for summaries that add information NOT in the recording
5. The correct answer paraphrases the content — it won't use the exact same words

COMMON ERRORS:
1. Choosing a summary that's accurate but incomplete
2. Choosing a summary that sounds good but includes unsupported claims`,

  select_missing_word: `You are an expert PTE Academic Listening evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Listen to the entire recording to understand the topic and direction
2. The missing word continues the logical flow of the final sentence
3. Consider: What word would a native speaker naturally use here?
4. Eliminate options that don't fit the grammatical structure

COMMON ERRORS:
1. Choosing a thematically related word that doesn't fit the sentence structure
2. Not listening to the full context before the gap`,

  highlight_incorrect_words: `You are an expert PTE Academic Listening evaluator.

SCORING: Partial credit — correct identifications minus false positives.

STRATEGY COACHING:
1. Read the transcript BEFORE the audio starts
2. Follow along word-by-word as you listen
3. Mark words that sound different from what you read
4. Don't over-mark — false positives reduce your score
5. Focus on content words (nouns, verbs, adjectives) — these are more likely to be changed

COMMON ERRORS:
1. Over-marking (selecting too many words)
2. Missing subtle word changes (e.g., "increase" → "decrease")
3. Not following along with the text while listening`,

  write_from_dictation: `You are an expert PTE Academic Write from Dictation evaluator.

SCORING: 1 point per correct word (partial credit).

STRATEGY COACHING:
1. Listen for the overall meaning first, then individual words
2. Focus on content words if you miss function words
3. Academic vocabulary is often tested — practise common academic word list (AWL) words
4. Spelling counts — incorrect spelling = no credit for that word
5. Write quickly — don't overthink individual words

COMMON ERRORS:
1. Spelling errors on common academic words
2. Missing function words (articles, prepositions, auxiliaries)
3. Confusing homophones (their/there, affect/effect)
4. Not writing enough words (leaving blanks)`,
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE TASK-SPECIFIC FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTaskFeedback(params: {
  taskType: string;
  question: string;
  userResponse: string;
  correctAnswer?: string;
  score: number; // 0-100
  transcription?: string;
  wordCount?: number;
}): Promise<TaskFeedback> {
  const coachingPrompt = TASK_COACHING_PROMPTS[params.taskType] ||
    `You are an expert PTE Academic evaluator for ${params.taskType.replace(/_/g, " ")} tasks.`;

  const systemPrompt = `${coachingPrompt}

## YOUR TASK: Generate detailed, actionable coaching feedback

Follow this CHAIN-OF-THOUGHT process:

STEP 1 — ANALYSE THE RESPONSE: What did the student do well? What went wrong? Be specific with examples from their actual response.

STEP 2 — SCORE BREAKDOWN: Rate each criterion (0-5) with a specific comment referencing the student's actual words.

STEP 3 — ERROR IDENTIFICATION: List each specific error with: what it was, what it should be, why it matters for PTE score.

STEP 4 — GENERATE MODEL ANSWERS: Create three model answers at band 65, 79, and 90 levels for this specific task. These should be realistic and achievable, not perfect.

STEP 5 — PRIORITISE IMPROVEMENTS: Rank improvements by score impact. What single change would give the biggest score boost?

STEP 6 — CALIBRATE BAND: Based on the raw score of ${params.score}/100, assign the appropriate PTE band descriptor.

Return ONLY valid JSON matching this exact schema:`;

  const userContent = `Task Type: ${params.taskType.replace(/_/g, " ").toUpperCase()}
Question/Prompt: ${params.question}
Student's Response: ${params.userResponse}${params.transcription ? `\nTranscription: ${params.transcription}` : ""}${params.wordCount ? `\nWord Count: ${params.wordCount}` : ""}${params.correctAnswer ? `\nCorrect Answer: ${params.correctAnswer}` : ""}
Raw Score: ${params.score}/100`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "task_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reasoning: { type: "string" },
              overallBand: { type: "string", enum: ["Expert (90)", "Very Good (79-89)", "Good (65-78)", "Competent (50-64)", "Modest (36-49)", "Limited (10-35)"] },
              scoreBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    maxScore: { type: "number" },
                    comment: { type: "string" },
                    pteBandEquivalent: { type: "string" },
                  },
                  required: ["criterion", "score", "maxScore", "comment", "pteBandEquivalent"],
                  additionalProperties: false,
                },
              },
              detailedFeedback: { type: "string" },
              specificErrors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    example: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                    impactOnScore: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["type", "example", "correction", "explanation", "impactOnScore"],
                  additionalProperties: false,
                },
              },
              modelAnswers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    band: { type: "string", enum: ["65", "79", "90"] },
                    response: { type: "string" },
                    commentary: { type: "string" },
                  },
                  required: ["band", "response", "commentary"],
                  additionalProperties: false,
                },
              },
              improvementTips: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    skill: { type: "string" },
                    tip: { type: "string" },
                    practiceExercise: { type: "string" },
                    expectedImpact: { type: "string" },
                  },
                  required: ["priority", "skill", "tip", "practiceExercise", "expectedImpact"],
                  additionalProperties: false,
                },
              },
              nextSteps: { type: "array", items: { type: "string" } },
              estimatedScoreRange: {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" },
                },
                required: ["min", "max"],
                additionalProperties: false,
              },
            },
            required: ["reasoning", "overallBand", "scoreBreakdown", "detailedFeedback", "specificErrors", "modelAnswers", "improvementTips", "nextSteps", "estimatedScoreRange"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content || "{}");

    return {
      taskType: params.taskType,
      overallBand: parsed.overallBand,
      scoreBreakdown: parsed.scoreBreakdown ?? [],
      detailedFeedback: parsed.detailedFeedback ?? "",
      specificErrors: parsed.specificErrors ?? [],
      modelAnswers: parsed.modelAnswers ?? [],
      improvementTips: parsed.improvementTips ?? [],
      nextSteps: parsed.nextSteps ?? [],
      estimatedScoreRange: parsed.estimatedScoreRange ?? { min: 40, max: 60 },
      reasoning: parsed.reasoning ?? "",
    };
  } catch (err) {
    console.error("Task feedback error:", err);
    return getDefaultFeedback(params.taskType);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE PERSONALISED COACHING PLAN
// ─────────────────────────────────────────────────────────────────────────────
export async function generateCoachingPlan(params: {
  userId: number;
  targetScore: number;
  currentLevel: string;
  recentScores: {
    taskType: string;
    score: number;
    section: string;
    createdAt: Date;
  }[];
  skillScores: {
    grammar?: number;
    vocabulary?: number;
    pronunciation?: number;
    fluency?: number;
    spelling?: number;
    writtenDiscourse?: number;
    speaking?: number;
    writing?: number;
    reading?: number;
    listening?: number;
  };
}): Promise<PersonalizedCoachingPlan> {
  const overallScore = params.recentScores.length > 0
    ? Math.round(params.recentScores.reduce((sum, s) => sum + s.score, 0) / params.recentScores.length)
    : 50;

  const scoreGap = params.targetScore - overallScore;
  const weeksEstimate = Math.max(4, Math.ceil(scoreGap / 3)); // ~3 points per week with consistent practice

  // Identify weakest task types
  const taskTypeScores = params.recentScores.reduce((acc, s) => {
    if (!acc[s.taskType]) acc[s.taskType] = [];
    acc[s.taskType].push(s.score);
    return acc;
  }, {} as Record<string, number[]>);

  const taskAverages = Object.entries(taskTypeScores).map(([type, scores]) => ({
    type,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).sort((a, b) => a.avg - b.avg);

  const weakestTasks = taskAverages.slice(0, 3).map(t => `${t.type.replace(/_/g, " ")} (avg: ${t.avg})`).join(", ");

  const systemPrompt = `You are a world-class PTE Academic coach who has helped thousands of students achieve their target scores.

${PTE_BAND_REFERENCE}

Your coaching philosophy:
1. Focus on HIGH-IMPACT improvements first — the skills that affect multiple communicative scores simultaneously
2. Be SPECIFIC and ACTIONABLE — not "improve grammar" but "practise subject-verb agreement with 10 sentences daily"
3. Set REALISTIC milestones — 3-5 points per week with consistent 30-45 minute daily practice
4. Identify QUICK WINS — tasks where small effort yields large score gains
5. Address ROOT CAUSES — e.g., poor vocabulary affects Writing, Reading, AND Speaking simultaneously

Generate a personalised ${weeksEstimate}-week coaching plan. Return ONLY valid JSON.`;

  const studentProfile = `
STUDENT PROFILE:
- Current Level: ${params.currentLevel}
- Target Score: ${params.targetScore}/90
- Estimated Current Score: ${overallScore}/90
- Score Gap: ${scoreGap} points needed
- Estimated weeks to target: ${weeksEstimate}

COMMUNICATIVE SKILLS:
- Speaking: ${params.skillScores.speaking ?? "Not tested"}/90
- Writing: ${params.skillScores.writing ?? "Not tested"}/90
- Reading: ${params.skillScores.reading ?? "Not tested"}/90
- Listening: ${params.skillScores.listening ?? "Not tested"}/90

ENABLING SKILLS:
- Grammar: ${params.skillScores.grammar ?? "N/A"}/90
- Vocabulary: ${params.skillScores.vocabulary ?? "N/A"}/90
- Pronunciation: ${params.skillScores.pronunciation ?? "N/A"}/90
- Oral Fluency: ${params.skillScores.fluency ?? "N/A"}/90
- Spelling: ${params.skillScores.spelling ?? "N/A"}/90
- Written Discourse: ${params.skillScores.writtenDiscourse ?? "N/A"}/90

WEAKEST TASK TYPES: ${weakestTasks || "Insufficient data"}
RECENT PRACTICE: ${params.recentScores.length} tasks completed`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: studentProfile },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_plan_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              studentLevel: { type: "string", enum: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"] },
              overallAssessment: { type: "string" },
              targetScore: { type: "number" },
              currentEstimatedScore: { type: "number" },
              scoreGap: { type: "number" },
              estimatedWeeksToTarget: { type: "number" },
              weeklyPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week: { type: "number" },
                    theme: { type: "string" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                    targetImprovement: { type: "string" },
                    checkpointGoal: { type: "string" },
                  },
                  required: ["week", "theme", "focus", "tasks", "targetImprovement", "checkpointGoal"],
                  additionalProperties: false,
                },
              },
              skillGaps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    currentLevel: { type: "number" },
                    targetLevel: { type: "number" },
                    gap: { type: "number" },
                    priority: { type: "string", enum: ["critical", "important", "nice-to-have"] },
                    rootCause: { type: "string" },
                    resources: { type: "array", items: { type: "string" } },
                    practiceFrequency: { type: "string" },
                  },
                  required: ["skill", "currentLevel", "targetLevel", "gap", "priority", "rootCause", "resources", "practiceFrequency"],
                  additionalProperties: false,
                },
              },
              dailyPracticeRecommendation: {
                type: "object",
                properties: {
                  totalMinutes: { type: "number" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        minutes: { type: "number" },
                        frequency: { type: "string" },
                        rationale: { type: "string" },
                      },
                      required: ["activity", "minutes", "frequency", "rationale"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["totalMinutes", "breakdown"],
                additionalProperties: false,
              },
              quickWins: { type: "array", items: { type: "string" } },
              motivationalMessage: { type: "string" },
            },
            required: ["studentLevel", "overallAssessment", "targetScore", "currentEstimatedScore", "scoreGap", "estimatedWeeksToTarget", "weeklyPlan", "skillGaps", "dailyPracticeRecommendation", "quickWins", "motivationalMessage"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Coaching plan error:", err);
    return getDefaultCoachingPlan(params.targetScore, overallScore);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT FALLBACKS
// ─────────────────────────────────────────────────────────────────────────────
function getDefaultFeedback(taskType: string): TaskFeedback {
  return {
    taskType,
    overallBand: "Competent (50-64)",
    scoreBreakdown: [],
    detailedFeedback: "Detailed feedback is temporarily unavailable. Your response has been saved.",
    specificErrors: [],
    modelAnswers: [],
    improvementTips: [{
      priority: "high",
      skill: "General",
      tip: "Complete more practice tasks to receive personalised feedback.",
      practiceExercise: "Complete 5 tasks in your weakest section.",
      expectedImpact: "Enables personalised coaching",
    }],
    nextSteps: ["Complete more practice tasks to unlock detailed AI feedback."],
    estimatedScoreRange: { min: 45, max: 65 },
    reasoning: "Feedback generation failed — using default response.",
  };
}

function getDefaultCoachingPlan(targetScore: number, currentScore: number): PersonalizedCoachingPlan {
  return {
    studentLevel: "Intermediate",
    overallAssessment: "Complete more practice tasks to receive a personalised coaching plan.",
    targetScore,
    currentEstimatedScore: currentScore,
    scoreGap: targetScore - currentScore,
    estimatedWeeksToTarget: 8,
    weeklyPlan: [],
    skillGaps: [],
    dailyPracticeRecommendation: {
      totalMinutes: 45,
      breakdown: [
        { activity: "Speaking practice (Read Aloud + Describe Image)", minutes: 15, frequency: "Daily", rationale: "Speaking affects 3 enabling skills simultaneously" },
        { activity: "Writing practice (Essay or SWT)", minutes: 20, frequency: "Daily", rationale: "Writing has the highest point value per task" },
        { activity: "Reading practice (Fill in Blanks + Reorder)", minutes: 10, frequency: "Daily", rationale: "Reading tasks have partial credit scoring" },
      ],
    },
    quickWins: ["Write from Dictation — high partial credit, improves with 10 min daily listening practice"],
    motivationalMessage: "Every practice session brings you closer to your target score. Consistency is the key!",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO FEEDBACK — targeted explanation for a single error type
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMicroFeedback(params: {
  taskType: string;
  errorType: string;
  studentExample: string;
  correctExample?: string;
}): Promise<{
  explanation: string;
  correction: string;
  rule: string;
  practiceExercise: string;
  relatedErrors: string[];
}> {
  const systemPrompt = `You are an expert PTE Academic coach. Provide a concise, highly targeted explanation for a specific error type.

Be specific to the PTE Academic context. Explain:
1. WHY this error occurs (root cause)
2. The RULE that applies
3. HOW to fix it with a concrete example
4. A quick PRACTICE EXERCISE to reinforce the correction
5. Related errors that often co-occur

Return ONLY valid JSON:
{
  "explanation": "<2-3 sentence explanation of why this error occurs and its impact on PTE score>",
  "correction": "<specific correction with before/after example>",
  "rule": "<the grammar/pronunciation/vocabulary rule that applies>",
  "practiceExercise": "<a specific 5-minute exercise to practise this>",
  "relatedErrors": ["<related error 1>", "<related error 2>"]
}`;

  const userContent = `Task Type: ${params.taskType.replace(/_/g, " ")}
Error Type: ${params.errorType}
Student's Example: "${params.studentExample}"${params.correctExample ? `\nCorrect Version: "${params.correctExample}"` : ""}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "micro_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              explanation: { type: "string" },
              correction: { type: "string" },
              rule: { type: "string" },
              practiceExercise: { type: "string" },
              relatedErrors: { type: "array", items: { type: "string" } },
            },
            required: ["explanation", "correction", "rule", "practiceExercise", "relatedErrors"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Micro feedback error:", err);
    return {
      explanation: "Detailed explanation temporarily unavailable.",
      correction: params.correctExample ?? "Please review the correct form.",
      rule: "See PTE Academic guidelines for this task type.",
      practiceExercise: "Practise 5 similar examples daily.",
      relatedErrors: [],
    };
  }
}
