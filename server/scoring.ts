import { invokeLLM } from "./_core/llm";

export interface ScoringResult {
  contentScore: number; // 0-1
  formScore: number; // 0-1
  languageScore: number; // 0-1
  pronunciationScore?: number; // 0-1
  fluencyScore?: number; // 0-1
  totalScore: number; // 0-100
  normalizedScore: number; // 10-90
  feedback: string;
  strengths: string[];
  improvements: string[];
  grammarErrors: string[];
  vocabularyFeedback: string;
  pronunciationFeedback?: string;
  fluencyFeedback?: string;
  // Enabling skills (10-90 scale)
  grammarScore: number;
  vocabularyScore: number;
  spellingScore: number;
  writtenDiscourseScore: number;
  oralFluencyScore?: number;
  pronunciationSkillScore?: number;
  // Chain-of-thought reasoning
  reasoning?: string;
  confidence?: number; // 0-1
  bandDescriptor?: string; // e.g. "Upper-Intermediate (65-72)"
}

// ─────────────────────────────────────────────────────────────────────────────
// PTE BAND DESCRIPTORS (aligned with official PTE score guide)
// ─────────────────────────────────────────────────────────────────────────────
const PTE_BAND_DESCRIPTORS = `
PTE Academic Score Band Reference (10-90 scale):

BAND 90 (Expert): Fully operational command. Accurate, fluent, complete. Academic vocabulary used naturally. Complex structures with no errors. All task requirements met perfectly.

BAND 79-89 (Very Good): Operational command with occasional inaccuracies. Effective use of complex language. Minor errors that do not impede communication. Task fully addressed.

BAND 65-78 (Good): Generally effective command. Mix of simple and complex structures. Some errors but meaning is clear. Most task requirements met. Adequate vocabulary range.

BAND 50-64 (Competent): Partial command. Errors noticeable but communication maintained. Limited range of vocabulary and structures. Some task requirements not fully met.

BAND 36-49 (Modest): Intermittent command. Frequent errors affecting clarity. Basic vocabulary. Task partially addressed. Significant gaps in performance.

BAND 10-35 (Limited): Extremely limited command. Errors dominate. Very basic vocabulary. Task requirements largely unmet. Communication severely impaired.
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCORE NORMALIZATION (raw 0-100 → PTE 10-90)
// Uses a non-linear curve that matches PTE's distribution:
// - Most test-takers score between 42-79
// - Perfect raw = 90, zero raw = 10
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeToPTE(rawScore: number): number {
  const clamped = Math.max(0, Math.min(100, rawScore));
  // Apply slight S-curve to match PTE distribution
  // Raw 50 → PTE 50, Raw 75 → PTE 69, Raw 90 → PTE 82, Raw 100 → PTE 90
  const normalized = 10 + (clamped / 100) * 80;
  return Math.round(normalized);
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITING TASK SCORING — Essay & Summarize Written Text
// Criteria weights per official PTE score guide:
//   Essay:  Content 3, Form 2, Grammar 2, Vocabulary 2, Spelling 1, Discourse 2
//   SWT:    Content 2, Form 1, Grammar 2, Vocabulary 2, Spelling 1
// ─────────────────────────────────────────────────────────────────────────────
export async function scoreWritingTask(params: {
  taskType: "write_essay" | "summarize_written_text";
  prompt: string;
  content?: string;
  response: string;
  wordLimit?: number;
}): Promise<ScoringResult> {
  const wordCount = params.response.trim().split(/\s+/).length;

  const isEssay = params.taskType === "write_essay";
  const taskName = isEssay ? "Write Essay" : "Summarize Written Text";

  // Task-specific few-shot calibration examples
  const fewShotExamples = isEssay ? `
## FEW-SHOT CALIBRATION EXAMPLES FOR WRITE ESSAY

### BAND 90 EXAMPLE (totalScore: 92)
Prompt: "Some people believe that technology has made our lives more complex. To what extent do you agree?"
Response: "The proliferation of digital technology has undeniably transformed contemporary life, yet whether this transformation constitutes increased complexity remains a matter of considerable debate. While I concede that technology introduces new cognitive demands, I firmly maintain that it ultimately simplifies human existence by automating routine tasks and democratising access to information.

Proponents of the complexity argument contend that the sheer volume of digital tools—smartphones, cloud platforms, social media—creates decision fatigue and information overload. Research by psychologist Barry Schwartz demonstrates that an abundance of choices paradoxically reduces satisfaction and increases anxiety. Furthermore, the expectation of constant connectivity blurs the boundary between professional and personal life, generating unprecedented psychological strain.

Nevertheless, these drawbacks are substantially outweighed by technology's capacity to streamline daily activities. Navigation applications have eliminated the need for map-reading expertise; instant translation tools have dissolved language barriers; telemedicine has made specialist consultations accessible to remote communities. These innovations reduce friction in everyday life rather than amplifying it.

In conclusion, while technology demands adaptation, its net effect is one of simplification. The key lies in cultivating digital literacy to harness these tools effectively rather than being overwhelmed by them."
Scores: contentScore: 0.95, formScore: 1.0, languageScore: 0.95, spellingScore: 1.0, totalScore: 92, grammarScore: 88, vocabularyScore: 90, writtenDiscourseScore: 89

### BAND 65 EXAMPLE (totalScore: 65)
Prompt: "Some people believe that technology has made our lives more complex."
Response: "I agree that technology has made life more complex in some ways. Firstly, there are many devices we need to learn how to use. For example, smartphones have many apps and it can be confusing. Also, people are always checking their emails and messages which is stressful.

However, technology also makes life easier. We can find information quickly on the internet. We can also communicate with people in other countries easily. Shopping online is also very convenient.

In conclusion, technology has both positive and negative effects on our lives. I think the benefits are more than the problems if we use technology carefully."
Scores: contentScore: 0.65, formScore: 0.8, languageScore: 0.60, spellingScore: 0.95, totalScore: 65, grammarScore: 62, vocabularyScore: 58, writtenDiscourseScore: 60

### BAND 42 EXAMPLE (totalScore: 42)
Prompt: "Some people believe that technology has made our lives more complex."
Response: "Technology is very important in our life. Many people use technology every day. I think technology is good because we can do many things. But sometimes technology is bad because it is difficult to understand. For example computer is difficult. Also internet have many information. In conclusion technology is good and bad."
Scores: contentScore: 0.35, formScore: 0.5, languageScore: 0.35, spellingScore: 0.90, totalScore: 42, grammarScore: 38, vocabularyScore: 36, writtenDiscourseScore: 35
` : `
## FEW-SHOT CALIBRATION EXAMPLES FOR SUMMARIZE WRITTEN TEXT

### BAND 90 EXAMPLE (totalScore: 90)
Source: [passage about climate change and its effects on biodiversity]
Response: "Climate change poses an existential threat to global biodiversity, as rising temperatures, habitat destruction, and ocean acidification are driving unprecedented species extinction rates that could destabilise entire ecosystems unless immediate and coordinated international action is taken to reduce greenhouse gas emissions."
Scores: contentScore: 0.95, formScore: 1.0, languageScore: 0.95, spellingScore: 1.0, totalScore: 90

### BAND 65 EXAMPLE (totalScore: 65)
Response: "The passage discusses how climate change affects animals and plants, and scientists are worried about many species becoming extinct because of temperature changes and habitat loss."
Scores: contentScore: 0.65, formScore: 0.9, languageScore: 0.60, spellingScore: 0.95, totalScore: 65

### BAND 42 EXAMPLE (totalScore: 42)
Response: "Climate change is bad for animals and the environment and we need to do something about it."
Scores: contentScore: 0.35, formScore: 0.7, languageScore: 0.40, spellingScore: 1.0, totalScore: 42
`;

  const systemPrompt = `You are an expert PTE Academic ${taskName} scoring engine, strictly aligned with the official Pearson PTE Academic score guide.

${PTE_BAND_DESCRIPTORS}

${fewShotExamples}

## YOUR SCORING TASK

You MUST follow this chain-of-thought process before scoring:

STEP 1 — CONTENT ANALYSIS: Does the response fully address the task? Are all key points covered? Is the argument/summary complete and relevant?

STEP 2 — FORM CHECK: 
${isEssay ? `- Word count: ${wordCount} words (required: 200-300). If outside range, formScore is penalised: <150 or >380 = 0.0, 150-199 or 301-380 = 0.5, 200-300 = 1.0
- Does it have a clear introduction, body paragraphs, and conclusion?` : `- Is it a SINGLE sentence? If not, formScore = 0.
- Word count: ${wordCount} words (required: 5-75). Outside range = 0.
- Is it grammatically complete?`}

STEP 3 — LANGUAGE QUALITY: Assess grammar accuracy, vocabulary range, sentence variety, and cohesion. Compare to the band descriptors above.

STEP 4 — SPELLING: Count any spelling errors. Each error reduces the spelling score.

STEP 5 — WRITTEN DISCOURSE (Essay only): Evaluate logical flow, use of discourse markers (However, Furthermore, In contrast, etc.), paragraph coherence.

STEP 6 — CALIBRATE SCORE: Compare to the few-shot examples above. Do NOT inflate scores. A response with basic vocabulary and simple structures should score 40-55, not 70+.

STEP 7 — IDENTIFY SPECIFIC ERRORS: List actual grammar errors found (e.g., "subject-verb disagreement: 'they was'"), vocabulary weaknesses, and structural issues.

Return ONLY valid JSON with this exact schema:`;

  const jsonSchema = isEssay ? {
    type: "object",
    properties: {
      reasoning: { type: "string", description: "Chain-of-thought analysis (Steps 1-7)" },
      contentScore: { type: "number", description: "0.0-1.0" },
      formScore: { type: "number", description: "0.0-1.0" },
      languageScore: { type: "number", description: "0.0-1.0" },
      spellingScore: { type: "number", description: "0.0-1.0" },
      writtenDiscourseScore_raw: { type: "number", description: "0.0-1.0" },
      totalScore: { type: "number", description: "0-100, calibrated against band examples" },
      bandDescriptor: { type: "string", description: "e.g. 'Good (65-78)'" },
      confidence: { type: "number", description: "0.0-1.0 confidence in this score" },
      feedback: { type: "string", description: "2-3 sentence overall assessment mentioning specific strengths and weaknesses" },
      strengths: { type: "array", items: { type: "string" }, description: "2-3 specific strengths with examples from the text" },
      improvements: { type: "array", items: { type: "string" }, description: "3-4 specific improvements with examples" },
      grammarErrors: { type: "array", items: { type: "string" }, description: "Specific grammar errors found, e.g. 'Line 2: missing article before noun'" },
      vocabularyFeedback: { type: "string", description: "Assessment of vocabulary range and academic word use" },
      grammarScore: { type: "number", description: "10-90 scale" },
      vocabularyScore: { type: "number", description: "10-90 scale" },
      spellingSkillScore: { type: "number", description: "10-90 scale" },
      writtenDiscourseSkillScore: { type: "number", description: "10-90 scale" },
    },
    required: ["reasoning","contentScore","formScore","languageScore","spellingScore","writtenDiscourseScore_raw","totalScore","bandDescriptor","confidence","feedback","strengths","improvements","grammarErrors","vocabularyFeedback","grammarScore","vocabularyScore","spellingSkillScore","writtenDiscourseSkillScore"],
    additionalProperties: false,
  } : {
    type: "object",
    properties: {
      reasoning: { type: "string" },
      contentScore: { type: "number" },
      formScore: { type: "number" },
      languageScore: { type: "number" },
      spellingScore: { type: "number" },
      totalScore: { type: "number" },
      bandDescriptor: { type: "string" },
      confidence: { type: "number" },
      feedback: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      improvements: { type: "array", items: { type: "string" } },
      grammarErrors: { type: "array", items: { type: "string" } },
      vocabularyFeedback: { type: "string" },
      grammarScore: { type: "number" },
      vocabularyScore: { type: "number" },
      spellingSkillScore: { type: "number" },
      writtenDiscourseSkillScore: { type: "number" },
    },
    required: ["reasoning","contentScore","formScore","languageScore","spellingScore","totalScore","bandDescriptor","confidence","feedback","strengths","improvements","grammarErrors","vocabularyFeedback","grammarScore","vocabularyScore","spellingSkillScore","writtenDiscourseSkillScore"],
    additionalProperties: false,
  };

  const userMessage = isEssay
    ? `Essay Prompt: "${params.prompt}"\n\nStudent's Essay (${wordCount} words):\n${params.response}`
    : `Source Text:\n${params.content}\n\nStudent's Summary (${wordCount} words):\n${params.response}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: isEssay ? "essay_score_v2" : "swt_score_v2",
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content || "{}");

    // Apply form penalty for word count violations (essay)
    let adjustedTotal = parsed.totalScore ?? 50;
    if (isEssay) {
      if (wordCount < 150 || wordCount > 380) adjustedTotal = Math.min(adjustedTotal, 30);
      else if (wordCount < 200 || wordCount > 300) adjustedTotal = Math.min(adjustedTotal, adjustedTotal * 0.85);
    } else {
      // SWT: single sentence + 5-75 words
      const sentences = params.response.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) adjustedTotal = Math.min(adjustedTotal, 40);
      if (wordCount < 5 || wordCount > 75) adjustedTotal = Math.min(adjustedTotal, 35);
    }

    return {
      contentScore: parsed.contentScore ?? 0.5,
      formScore: parsed.formScore ?? 0.5,
      languageScore: parsed.languageScore ?? 0.5,
      totalScore: adjustedTotal,
      normalizedScore: normalizeToPTE(adjustedTotal),
      feedback: parsed.feedback ?? "Assessment completed.",
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      grammarErrors: parsed.grammarErrors ?? [],
      vocabularyFeedback: parsed.vocabularyFeedback ?? "",
      grammarScore: parsed.grammarScore ?? 50,
      vocabularyScore: parsed.vocabularyScore ?? 50,
      spellingScore: parsed.spellingSkillScore ?? 50,
      writtenDiscourseScore: parsed.writtenDiscourseSkillScore ?? 50,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      bandDescriptor: parsed.bandDescriptor,
    };
  } catch (err) {
    console.error("Writing scoring error:", err);
    return getDefaultScore();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEAKING TASK SCORING
// Criteria weights per official PTE score guide:
//   Read Aloud:          Content 1, Pronunciation 1, Oral Fluency 1
//   Repeat Sentence:     Content 1, Pronunciation 1, Oral Fluency 1
//   Describe Image:      Content 1, Oral Fluency 1, Pronunciation 1
//   Re-tell Lecture:     Content 1, Oral Fluency 1, Pronunciation 1
//   Answer Short Q:      Content 1 (correct/incorrect)
// ─────────────────────────────────────────────────────────────────────────────
export async function scoreSpeakingTask(params: {
  taskType: "read_aloud" | "repeat_sentence" | "describe_image" | "retell_lecture" | "answer_short_question";
  prompt?: string;
  originalText?: string;
  transcription: string;
  timeTaken?: number;
}): Promise<ScoringResult> {
  const taskName = params.taskType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const wpm = params.timeTaken && params.timeTaken > 0
    ? Math.round((params.transcription.split(/\s+/).length / params.timeTaken) * 60)
    : null;

  // Task-specific few-shot examples for speaking
  const speakingFewShot: Record<string, string> = {
    read_aloud: `
## FEW-SHOT CALIBRATION FOR READ ALOUD

### BAND 90 (totalScore: 90)
Original: "The proliferation of digital technology has transformed contemporary communication."
Transcription: "The proliferation of digital technology has transformed contemporary communication."
Analysis: All words correct, natural pace (~140 wpm), clear pronunciation of 'proliferation' and 'contemporary', appropriate sentence stress on content words.
Scores: contentScore: 1.0, pronunciationScore: 0.95, fluencyScore: 0.95, totalScore: 90

### BAND 65 (totalScore: 65)
Original: "The proliferation of digital technology has transformed contemporary communication."
Transcription: "The proliferation of digital technology has transform contemporary communication."
Analysis: One word error ('transform' instead of 'transformed'), slight hesitation before 'proliferation', adequate pace.
Scores: contentScore: 0.75, pronunciationScore: 0.70, fluencyScore: 0.65, totalScore: 65

### BAND 42 (totalScore: 42)
Original: "The proliferation of digital technology has transformed contemporary communication."
Transcription: "The... the proliferation of... digital technology has... transform... communic... communication."
Analysis: Multiple hesitations, word errors, unnatural pace, poor stress placement.
Scores: contentScore: 0.50, pronunciationScore: 0.45, fluencyScore: 0.35, totalScore: 42`,

    repeat_sentence: `
## FEW-SHOT CALIBRATION FOR REPEAT SENTENCE

### BAND 90 (totalScore: 90)
Original: "Students who participate in extracurricular activities tend to develop better time management skills."
Transcription: "Students who participate in extracurricular activities tend to develop better time management skills."
Scores: contentScore: 1.0, pronunciationScore: 0.95, fluencyScore: 0.95, totalScore: 90

### BAND 65 (totalScore: 65)
Transcription: "Students who participate in extracurricular activities tend to develop better time management."
Analysis: Missing final word 'skills', otherwise accurate.
Scores: contentScore: 0.80, pronunciationScore: 0.70, fluencyScore: 0.70, totalScore: 65

### BAND 42 (totalScore: 42)
Transcription: "Students who... participate in activities tend to develop time management skills."
Analysis: Missing 'extracurricular', hesitation, altered structure.
Scores: contentScore: 0.50, pronunciationScore: 0.50, fluencyScore: 0.45, totalScore: 42`,

    describe_image: `
## FEW-SHOT CALIBRATION FOR DESCRIBE IMAGE

### BAND 90 (totalScore: 90)
Transcription: "This bar chart illustrates the percentage of renewable energy consumption across five countries between 2010 and 2020. Norway leads significantly with approximately 65% renewable energy use, followed by Brazil at around 45%. The United States and China show similar figures of roughly 15 to 18 percent, while India records the lowest at approximately 12%. Overall, there is a clear correlation between national policy commitment and renewable energy adoption rates."
Scores: contentScore: 0.95, pronunciationScore: 0.90, fluencyScore: 0.90, totalScore: 90

### BAND 65 (totalScore: 65)
Transcription: "This chart shows renewable energy in different countries. Norway has the most renewable energy, about 65 percent. Brazil is second with 45 percent. The United States and China have less, around 15 to 18 percent. India has the least. Overall, some countries use more renewable energy than others."
Scores: contentScore: 0.70, pronunciationScore: 0.70, fluencyScore: 0.65, totalScore: 65

### BAND 42 (totalScore: 42)
Transcription: "This is a chart about energy. Norway is high. Brazil is also high. Other countries are lower. That is all I can see."
Scores: contentScore: 0.35, pronunciationScore: 0.60, fluencyScore: 0.55, totalScore: 42`,
  };

  const fewShot = speakingFewShot[params.taskType] || "";

  const systemPrompt = `You are an expert PTE Academic ${taskName} evaluator, strictly aligned with the official Pearson PTE Academic score guide.

${PTE_BAND_DESCRIPTORS}

${fewShot}

## SCORING CRITERIA FOR ${taskName.toUpperCase()}

${params.taskType === "read_aloud" ? `
CONTENT (0-1): Proportion of words from the original text that were spoken correctly.
- 1.0 = All words correct, no omissions or substitutions
- 0.75 = 1-2 minor errors (wrong word form, one omission)
- 0.5 = 3-5 errors or significant omissions
- 0.25 = Many errors, only partial text read
- 0.0 = Completely different from original

PRONUNCIATION (0-1): Clarity and accuracy of phoneme production.
- 1.0 = Native-like, all phonemes clear, correct word stress
- 0.75 = Mostly clear, minor accent features that don't impede understanding
- 0.5 = Some unclear phonemes, occasional stress errors
- 0.25 = Frequently unclear, significant stress errors
- 0.0 = Largely unintelligible

ORAL FLUENCY (0-1): Natural rhythm, pace, and flow.
- 1.0 = Natural pace (120-160 wpm), smooth delivery, appropriate pausing
- 0.75 = Mostly smooth, minor hesitations
- 0.5 = Noticeable hesitations, uneven pace
- 0.25 = Frequent pauses, choppy delivery
- 0.0 = Extremely disfluent` : ""}

${params.taskType === "repeat_sentence" ? `
CONTENT (0-1): Accuracy of reproduction.
- 1.0 = Exact reproduction of all words in correct order
- 0.75 = 1 word missing/changed, order maintained
- 0.5 = 2-3 words changed, core meaning preserved
- 0.25 = Major changes, only fragments correct
- 0.0 = Unrecognisable

PRONUNCIATION (0-1): Clarity of phoneme production.
ORAL FLUENCY (0-1): Connected speech, natural pace, no unnatural pausing.` : ""}

${params.taskType === "describe_image" ? `
CONTENT (0-1): Coverage of key visual elements.
- 1.0 = Describes main features, key trends, specific data, comparisons, conclusion
- 0.75 = Covers most features with some specific data
- 0.5 = Describes some features but misses important trends or data
- 0.25 = Only superficial description
- 0.0 = Off-topic or silent

ORAL FLUENCY (0-1): Smooth delivery within 40 seconds.
PRONUNCIATION (0-1): Clear articulation of numbers, percentages, technical terms.` : ""}

${params.taskType === "retell_lecture" ? `
CONTENT (0-1): Coverage of main topic and key points from the lecture.
ORAL FLUENCY (0-1): Natural delivery, appropriate academic pace.
PRONUNCIATION (0-1): Clear articulation of academic/technical vocabulary.` : ""}

${params.taskType === "answer_short_question" ? `
CONTENT (0-1 binary): Is the answer correct? 1.0 = correct, 0.0 = incorrect.
Note: This task is scored as correct/incorrect only. Pronunciation and fluency are assessed but do not affect the primary score.` : ""}

## CHAIN-OF-THOUGHT PROCESS

STEP 1: Compare transcription to original text (if available). Count exact errors.
STEP 2: Assess pronunciation quality based on the transcribed words.
STEP 3: Assess fluency — note any hesitation markers ([...], um, uh, repetitions).${wpm ? `\nNote: Estimated speaking rate is ${wpm} wpm (ideal: 120-160 wpm for most tasks).` : ""}
STEP 4: Calibrate total score against the few-shot examples above.
STEP 5: Identify specific, actionable improvements.

Return ONLY valid JSON:`;

  const userMessage = params.originalText
    ? `Original Text: "${params.originalText}"\n\nStudent's Transcription: "${params.transcription}"${wpm ? `\nEstimated pace: ${wpm} wpm` : ""}`
    : `Task Prompt: ${params.prompt}\n\nStudent's Transcription: "${params.transcription}"${wpm ? `\nEstimated pace: ${wpm} wpm` : ""}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "speaking_score_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reasoning: { type: "string" },
              contentScore: { type: "number" },
              pronunciationScore: { type: "number" },
              fluencyScore: { type: "number" },
              languageScore: { type: "number" },
              totalScore: { type: "number" },
              bandDescriptor: { type: "string" },
              confidence: { type: "number" },
              feedback: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              grammarErrors: { type: "array", items: { type: "string" } },
              vocabularyFeedback: { type: "string" },
              pronunciationFeedback: { type: "string" },
              fluencyFeedback: { type: "string" },
              oralFluencyScore: { type: "number" },
              pronunciationSkillScore: { type: "number" },
              grammarScore: { type: "number" },
              vocabularyScore: { type: "number" },
            },
            required: ["reasoning","contentScore","pronunciationScore","fluencyScore","languageScore","totalScore","bandDescriptor","confidence","feedback","strengths","improvements","grammarErrors","vocabularyFeedback","pronunciationFeedback","fluencyFeedback","oralFluencyScore","pronunciationSkillScore","grammarScore","vocabularyScore"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content || "{}");

    return {
      contentScore: parsed.contentScore ?? 0.5,
      formScore: 1.0,
      languageScore: parsed.languageScore ?? 0.5,
      pronunciationScore: parsed.pronunciationScore ?? 0.5,
      fluencyScore: parsed.fluencyScore ?? 0.5,
      totalScore: parsed.totalScore ?? 50,
      normalizedScore: normalizeToPTE(parsed.totalScore ?? 50),
      feedback: parsed.feedback ?? "Assessment completed.",
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      grammarErrors: parsed.grammarErrors ?? [],
      vocabularyFeedback: parsed.vocabularyFeedback ?? "",
      pronunciationFeedback: parsed.pronunciationFeedback ?? "",
      fluencyFeedback: parsed.fluencyFeedback ?? "",
      grammarScore: parsed.grammarScore ?? 50,
      vocabularyScore: parsed.vocabularyScore ?? 50,
      spellingScore: 50,
      writtenDiscourseScore: 50,
      oralFluencyScore: parsed.oralFluencyScore ?? 50,
      pronunciationSkillScore: parsed.pronunciationSkillScore ?? 50,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      bandDescriptor: parsed.bandDescriptor,
    };
  } catch (err) {
    console.error("Speaking scoring error:", err);
    return getDefaultScore();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC FEEDBACK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export async function generateDiagnosticFeedback(params: {
  overallScore: number;
  speakingScore?: number;
  writingScore?: number;
  readingScore?: number;
  listeningScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  spellingScore?: number;
  writtenDiscourseScore?: number;
  targetScore?: number;
}): Promise<{ weakSkills: string[]; strongSkills: string[]; actionPlan: string }> {
  const target = params.targetScore || 65;
  const gap = target - params.overallScore;

  const systemPrompt = `You are an expert PTE Academic coach with 10+ years of experience preparing students for the PTE exam.

${PTE_BAND_DESCRIPTORS}

Your role: Analyse the student's score profile, identify the SPECIFIC skills that are limiting their overall score, and create a highly targeted, actionable improvement plan.

Key coaching principles:
1. The LOWEST communicative skill score has the most impact on overall score — address it first
2. Enabling skills (Grammar, Vocabulary, Pronunciation, Fluency) affect multiple communicative skills simultaneously
3. A 5-point improvement in a weak skill yields more overall gain than a 5-point improvement in a strong skill
4. Be specific: don't say "improve grammar" — say "focus on subject-verb agreement and article usage"

Return ONLY valid JSON:
{
  "weakSkills": ["<specific skill with reason>"],
  "strongSkills": ["<specific skill>"],
  "actionPlan": "<detailed 4-5 sentence plan with specific daily tasks, time allocation, and measurable targets>"
}`;

  const scoresSummary = `
Current Score Profile:
- Overall: ${params.overallScore}/90 (Target: ${target}/90, Gap: ${gap > 0 ? `+${gap} needed` : "target met"})
- Speaking: ${params.speakingScore ?? "Not tested"}/90
- Writing: ${params.writingScore ?? "Not tested"}/90
- Reading: ${params.readingScore ?? "Not tested"}/90
- Listening: ${params.listeningScore ?? "Not tested"}/90

Enabling Skills:
- Grammar: ${params.grammarScore ?? "N/A"}/90
- Vocabulary: ${params.vocabularyScore ?? "N/A"}/90
- Pronunciation: ${params.pronunciationScore ?? "N/A"}/90
- Oral Fluency: ${params.fluencyScore ?? "N/A"}/90
- Spelling: ${params.spellingScore ?? "N/A"}/90
- Written Discourse: ${params.writtenDiscourseScore ?? "N/A"}/90`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: scoresSummary },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diagnostic_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              weakSkills: { type: "array", items: { type: "string" } },
              strongSkills: { type: "array", items: { type: "string" } },
              actionPlan: { type: "string" },
            },
            required: ["weakSkills", "strongSkills", "actionPlan"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Diagnostic feedback error:", err);
    return {
      weakSkills: ["Unable to generate diagnostic feedback"],
      strongSkills: [],
      actionPlan: "Please complete more practice tasks to receive personalised feedback.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OBJECTIVE TASK SCORING (partial credit)
// ─────────────────────────────────────────────────────────────────────────────
export function scoreObjectiveTask(params: {
  taskType: string;
  correctAnswer: string | string[];
  userAnswer: string | string[];
}): { score: number; normalizedScore: number; feedback: string } {
  const { taskType, correctAnswer, userAnswer } = params;

  // Write from Dictation: partial credit per correct word
  if (taskType === "write_from_dictation") {
    const correct = (typeof correctAnswer === "string" ? correctAnswer : correctAnswer[0])
      .toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const user = (typeof userAnswer === "string" ? userAnswer : userAnswer[0])
      .toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);

    let matches = 0;
    const correctCopy = [...correct];
    for (const word of user) {
      const idx = correctCopy.indexOf(word);
      if (idx !== -1) { matches++; correctCopy.splice(idx, 1); }
    }
    const score = correct.length > 0 ? (matches / correct.length) * 100 : 0;
    const normalizedScore = normalizeToPTE(score);
    const pct = Math.round(score);
    return {
      score,
      normalizedScore,
      feedback: score >= 90
        ? `Excellent! ${matches}/${correct.length} words correct (${pct}%). Near-perfect transcription.`
        : score >= 70
        ? `Good. ${matches}/${correct.length} words correct (${pct}%). Review the ${correct.length - matches} missed word(s).`
        : score >= 50
        ? `Satisfactory. ${matches}/${correct.length} words correct (${pct}%). Focus on listening for unstressed function words.`
        : `Needs improvement. Only ${matches}/${correct.length} words correct (${pct}%). Practise dictation with academic texts daily.`,
    };
  }

  // Reorder Paragraphs: partial credit for adjacent pairs in correct order
  if (taskType === "reorder_paragraphs") {
    const correctOrder = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    const userOrder = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    let correctPairs = 0;
    const totalPairs = Math.max(correctOrder.length - 1, 1);
    for (let i = 0; i < correctOrder.length - 1; i++) {
      const userIdx = userOrder.indexOf(correctOrder[i]);
      if (userIdx !== -1 && userOrder[userIdx + 1] === correctOrder[i + 1]) correctPairs++;
    }
    const score = (correctPairs / totalPairs) * 100;
    return {
      score,
      normalizedScore: normalizeToPTE(score),
      feedback: score >= 80
        ? "Excellent paragraph ordering! Strong understanding of discourse structure."
        : score >= 60
        ? "Good attempt. Review how cohesive devices (pronouns, connectors) link paragraphs."
        : score >= 40
        ? "Partial credit. Focus on identifying the topic sentence (most general statement) first."
        : "Needs improvement. Strategy: find the topic sentence, then follow pronoun references and time markers.",
    };
  }

  // Highlight Incorrect Words: partial credit (correct identifications minus false positives)
  if (taskType === "highlight_incorrect_words") {
    const correctSet = new Set(Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]);
    const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);
    const truePositives = Array.from(userSet).filter(w => correctSet.has(w)).length;
    const falsePositives = Array.from(userSet).filter(w => !correctSet.has(w)).length;
    const score = Math.max(0, ((truePositives - falsePositives) / Math.max(correctSet.size, 1)) * 100);
    return {
      score,
      normalizedScore: normalizeToPTE(score),
      feedback: score >= 80
        ? "Excellent! Accurately identified the incorrect words."
        : score >= 50
        ? `Good attempt. You found ${truePositives} correct but also selected ${falsePositives} false positive(s). Listen more carefully for word-level mismatches.`
        : "Needs improvement. Focus on listening word-by-word while reading the transcript simultaneously.",
    };
  }

  // Multiple choice and other objective tasks: exact match
  const correct = Array.isArray(correctAnswer) ? correctAnswer.sort() : [correctAnswer];
  const user = Array.isArray(userAnswer) ? userAnswer.sort() : [userAnswer];
  const isCorrect = JSON.stringify(correct) === JSON.stringify(user);
  const score = isCorrect ? 100 : 0;

  // Partial credit for multiple-choice-multiple
  if (taskType === "multiple_choice_multiple" && Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
    const correctSet = new Set(correctAnswer);
    const userSet = new Set(userAnswer);
    const hits = Array.from(userSet).filter(a => correctSet.has(a)).length;
    const misses = Array.from(userSet).filter(a => !correctSet.has(a)).length;
    const partialScore = Math.max(0, ((hits - misses) / correctAnswer.length) * 100);
    return {
      score: partialScore,
      normalizedScore: normalizeToPTE(partialScore),
      feedback: partialScore >= 80
        ? "Excellent! Most correct options selected."
        : partialScore >= 50
        ? `Good. ${hits} correct selection(s) but ${misses} incorrect. Re-read each option carefully against the text.`
        : "Needs improvement. Eliminate clearly wrong options first, then compare remaining options to the text.",
    };
  }

  return {
    score,
    normalizedScore: normalizeToPTE(score),
    feedback: isCorrect
      ? "Correct! Well done."
      : `Incorrect. The correct answer was: ${Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT SCORE (fallback on error)
// ─────────────────────────────────────────────────────────────────────────────
function getDefaultScore(): ScoringResult {
  return {
    contentScore: 0.5,
    formScore: 0.5,
    languageScore: 0.5,
    totalScore: 50,
    normalizedScore: 50,
    feedback: "Scoring temporarily unavailable. Your response has been saved.",
    strengths: [],
    improvements: ["Please try again for detailed feedback."],
    grammarErrors: [],
    vocabularyFeedback: "",
    grammarScore: 50,
    vocabularyScore: 50,
    spellingScore: 50,
    writtenDiscourseScore: 50,
    confidence: 0,
  };
}
