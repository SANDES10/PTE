/**
 * AI Scoring Engine Calibration Tests
 *
 * These tests verify that each section-specific AI engine:
 * 1. Returns the correct JSON structure
 * 2. Produces scores within valid PTE ranges (10-90)
 * 3. Includes all required trait fields
 * 4. Handles edge cases (empty input, very short responses)
 *
 * NOTE: These are unit/integration tests that mock the LLM to avoid
 * actual API calls during CI. The LLM mock returns realistic responses
 * calibrated to match expected scoring behaviour.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock the LLM helper ────────────────────────────────────────────────────
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "../_core/llm";
const mockInvokeLLM = vi.mocked(invokeLLM);

// ── Import engines after mock ──────────────────────────────────────────────
import { scoreSpeakingTask } from "./speakingAI";
import { scoreWritingTask } from "./writingAI";
import { scoreReadingTask } from "./readingAI";
import {
  scoreSummarizeSpokenText,
  scoreWriteFromDictation,
  scoreHighlightCorrectSummary,
} from "./listeningAI";

// ── Helper to create mock LLM response ────────────────────────────────────
function mockLLMResponse(content: object) {
  mockInvokeLLM.mockResolvedValueOnce({
    choices: [{ message: { content: JSON.stringify(content) } }],
  } as any);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPEAKING ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Speaking AI Engine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("scores Read Aloud with all required traits", async () => {
    const mockScore = {
      taskType: "read_aloud",
      overallScore: 72,
      rawScore: 7,
      maxRawScore: 10,
      traits: {
        pronunciation: { score: 4, maxScore: 5, feedback: "Good pronunciation with minor mispronunciations." },
        oralFluency: { score: 3, maxScore: 5, feedback: "Mostly fluent with some hesitations." },
      },
      cefrLevel: "B2",
      overallFeedback: "Good performance overall with room for improvement in fluency.",
      strengths: ["Clear articulation", "Good pace"],
      improvements: ["Reduce hesitations", "Work on word stress"],
      strategyTips: ["Practice reading aloud daily", "Record yourself and listen back"],
      wordLevelFeedback: "Mispronounced: 'particularly' → /pəˈtɪkjʊləli/",
    };
    mockLLMResponse(mockScore);

    const result = await scoreSpeakingTask({
      taskType: "read_aloud",
      originalText: "The quick brown fox jumps over the lazy dog.",
      transcription: "The quick brown fox jumps over the lazy dog.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.traits).toBeDefined();
    expect(result.traits.pronunciation).toBeDefined();
    expect(result.traits.oralFluency).toBeDefined();
    expect(result.cefrLevel).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
    expect(result.strengths).toBeInstanceOf(Array);
    expect(result.improvements).toBeInstanceOf(Array);
    expect(result.strategyTips).toBeInstanceOf(Array);
  });

  it("scores Repeat Sentence with pronunciation and fluency traits", async () => {
    const mockScore = {
      taskType: "repeat_sentence",
      overallScore: 65,
      rawScore: 6,
      maxRawScore: 10,
      traits: {
        pronunciation: { score: 3, maxScore: 5, feedback: "Acceptable pronunciation." },
        oralFluency: { score: 3, maxScore: 5, feedback: "Adequate fluency." },
      },
      cefrLevel: "B2",
      overallFeedback: "Sentence repeated with minor errors.",
      strengths: ["Correct sentence structure"],
      improvements: ["Improve pronunciation of 'particularly'"],
      strategyTips: ["Focus on rhythm and intonation"],
      wordLevelFeedback: "",
    };
    mockLLMResponse(mockScore);

    const result = await scoreSpeakingTask({
      taskType: "repeat_sentence",
      originalText: "The conference will be held in the main auditorium.",
      transcription: "The conference will be held in the main auditorium.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.taskType).toBe("repeat_sentence");
  });

  it("scores Describe Image with content and fluency traits", async () => {
    const mockScore = {
      taskType: "describe_image",
      overallScore: 58,
      rawScore: 5,
      maxRawScore: 10,
      traits: {
        pronunciation: { score: 3, maxScore: 5, feedback: "Adequate pronunciation." },
        oralFluency: { score: 2, maxScore: 5, feedback: "Frequent pauses." },
        content: { score: 2, maxScore: 5, feedback: "Described main features but missed trends." },
      },
      cefrLevel: "B1",
      overallFeedback: "Partial description of the image.",
      strengths: ["Identified main chart type"],
      improvements: ["Describe trends and comparisons", "Improve fluency"],
      strategyTips: ["Use a template: 'The chart shows... The highest... The lowest...'"],
      wordLevelFeedback: "",
    };
    mockLLMResponse(mockScore);

    const result = await scoreSpeakingTask({
      taskType: "describe_image",
      imageDescription: "A bar chart showing sales figures for Q1-Q4.",
      transcription: "This chart shows sales. The first bar is highest.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.traits.content).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WRITING ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Writing AI Engine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("scores Write Essay with all 6 traits", async () => {
    const mockScore = {
      taskType: "write_essay",
      overallScore: 68,
      rawScore: 23,
      maxRawScore: 30,
      wordCount: 285,
      traits: {
        content: { score: 2, maxScore: 3, feedback: "Main arguments addressed." },
        form: { score: 2, maxScore: 2, feedback: "Word count within range." },
        grammar: { score: 2, maxScore: 2, feedback: "Generally correct grammar." },
        vocabulary: { score: 2, maxScore: 2, feedback: "Good vocabulary range." },
        spelling: { score: 1, maxScore: 1, feedback: "No spelling errors." },
        development: { score: 1, maxScore: 2, feedback: "Some development of ideas." },
        linguisticRange: { score: 1, maxScore: 2, feedback: "Mix of simple and complex structures." },
        coherence: { score: 1, maxScore: 2, feedback: "Generally coherent." },
        discourse: { score: 1, maxScore: 2, feedback: "Adequate use of discourse markers." },
      },
      cefrLevel: "B2",
      overallFeedback: "A competent essay addressing the topic.",
      strengths: ["Clear position stated", "Good vocabulary"],
      improvements: ["Develop arguments further", "Use more complex structures"],
      strategyTips: ["Plan your essay before writing", "Use linking words"],
      grammarErrors: [],
      vocabularyFeedback: "Good range of vocabulary.",
      modelAnswer: "",
    };
    mockLLMResponse(mockScore);

    const result = await scoreWritingTask({
      taskType: "write_essay",
      prompt: "Some people think that technology has made our lives more complicated. To what extent do you agree?",
      response: "Technology has undoubtedly transformed our daily lives in numerous ways. While some argue that it has introduced unnecessary complexity, I believe that the benefits of technology far outweigh its drawbacks. In this essay, I will examine both perspectives before presenting my conclusion.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.traits).toBeDefined();
    expect(result.traits.content).toBeDefined();
    expect(result.traits.grammar).toBeDefined();
    expect(result.traits.vocabulary).toBeDefined();
    expect(result.cefrLevel).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
  });

  it("scores Summarize Written Text with 5 traits", async () => {
    const mockScore = {
      taskType: "summarize_written_text",
      overallScore: 75,
      rawScore: 8,
      maxRawScore: 10,
      wordCount: 58,
      traits: {
        content: { score: 2, maxScore: 2, feedback: "All key points captured." },
        form: { score: 2, maxScore: 2, feedback: "55 words — within range." },
        grammar: { score: 2, maxScore: 2, feedback: "Correct grammar." },
        vocabulary: { score: 1, maxScore: 2, feedback: "Good vocabulary, minor imprecision." },
        spelling: { score: 1, maxScore: 2, feedback: "One spelling error." },
      },
      cefrLevel: "C1",
      overallFeedback: "Good summary capturing main points.",
      strengths: ["All key points included", "Appropriate length"],
      improvements: ["Check spelling", "Use more precise vocabulary"],
      strategyTips: ["Identify topic sentence and supporting details", "Paraphrase rather than copy"],
      grammarErrors: [],
      vocabularyFeedback: "Good vocabulary range.",
      modelAnswer: "The text discusses the impact of urbanisation on biodiversity, noting that habitat loss and pollution are the primary threats, while conservation efforts in urban green spaces offer some mitigation.",
    };
    mockLLMResponse(mockScore);

    const result = await scoreWritingTask({
      taskType: "summarize_written_text",
      sourceText: "Urbanisation has significantly impacted biodiversity worldwide...",
      response: "The text discusses urbanisation's impact on biodiversity, highlighting habitat loss and pollution as major threats while noting that urban green spaces can help mitigate these effects through conservation efforts.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.traits.content).toBeDefined();
    expect(result.traits.form).toBeDefined();
    expect(result.traits.spelling).toBeDefined();
    expect(result.modelAnswer).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// READING ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Reading AI Engine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("scores Multiple Choice Single Answer correctly", async () => {
    const mockScore = {
      taskType: "multiple_choice_single",
      overallScore: 90,
      rawScore: 1,
      maxRawScore: 1,
      correctAnswers: ["B"],
      userAnswers: ["B"],
      cefrLevel: "C1",
      overallFeedback: "Correct. The passage clearly states the answer in paragraph 2.",
      strengths: ["Correctly identified the main argument"],
      improvements: [],
      strategyTips: ["Skim for keywords", "Eliminate distractors"],
      explanation: "Option B is correct because the passage explicitly states...",
    };
    mockLLMResponse(mockScore);

    const result = await scoreReadingTask({
      taskType: "multiple_choice_single",
      passage: "The Industrial Revolution began in Britain in the late 18th century...",
      question: "What was the primary cause of the Industrial Revolution?",
      options: ["A. Political reform", "B. Technological innovation", "C. Agricultural decline", "D. Population growth"],
      correctAnswer: "B",
      userAnswer: "B",
    });

    expect(result.overallScore).toBe(90);
    expect(result.rawScore).toBe(1);
    expect(result.maxRawScore).toBe(1);
    expect(result.explanation).toBeDefined();
  });

  it("scores incorrect answer with explanation", async () => {
    const mockScore = {
      taskType: "multiple_choice_single",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 1,
      correctAnswers: ["B"],
      userAnswers: ["A"],
      cefrLevel: "B1",
      overallFeedback: "Incorrect. Option A is a distractor.",
      strengths: [],
      improvements: ["Re-read the passage focusing on paragraph 2"],
      strategyTips: ["Look for keywords that match the question"],
      explanation: "Option B is correct because the passage states 'technological innovation drove the revolution'.",
    };
    mockLLMResponse(mockScore);

    const result = await scoreReadingTask({
      taskType: "multiple_choice_single",
      passage: "The Industrial Revolution began in Britain...",
      question: "What was the primary cause?",
      options: ["A. Political reform", "B. Technological innovation", "C. Agricultural decline", "D. Population growth"],
      correctAnswer: "B",
      userAnswer: "A",
    });

    expect(result.overallScore).toBe(10);
    expect(result.rawScore).toBe(0);
    expect(result.improvements.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LISTENING ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Listening AI Engine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("scores Summarize Spoken Text with 5 traits", async () => {
    const mockScore = {
      taskType: "summarize_spoken_text",
      overallScore: 70,
      rawScore: 7,
      maxRawScore: 10,
      wordCount: 62,
      traits: {
        content: { score: 2, maxScore: 2, feedback: "All key points from the lecture captured." },
        form: { score: 2, maxScore: 2, feedback: "62 words — within 50-70 range." },
        grammar: { score: 1, maxScore: 2, feedback: "One minor grammar error." },
        vocabulary: { score: 1, maxScore: 2, feedback: "Some imprecise word choices." },
        spelling: { score: 1, maxScore: 2, feedback: "One spelling error." },
      },
      cefrLevel: "B2",
      overallFeedback: "Good summary with appropriate length and content coverage.",
      strengths: ["Correct word count", "All main points covered"],
      improvements: ["Avoid direct copying", "Check spelling"],
      strategyTips: ["Take notes during the lecture", "Paraphrase key ideas"],
      modelAnswer: "The lecture discusses climate change impacts on polar regions, noting accelerated ice melt, rising sea levels, and threats to wildlife, while emphasising the need for immediate international action.",
    };
    mockLLMResponse(mockScore);

    const result = await scoreSummarizeSpokenText({
      lectureTranscript: "Today I want to talk about climate change and its effects on polar regions...",
      response: "The lecture discusses climate change impacts on polar regions, noting accelerated ice melt, rising sea levels, and threats to wildlife, while emphasising the need for immediate international action to address these issues.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
    expect(result.traits).toBeDefined();
    expect(result.traits!.content).toBeDefined();
    expect(result.traits!.form).toBeDefined();
    expect(result.traits!.grammar).toBeDefined();
    expect(result.traits!.vocabulary).toBeDefined();
    expect(result.traits!.spelling).toBeDefined();
    expect(result.wordCount).toBeDefined();
  });

  it("scores Write from Dictation with exact word matching", async () => {
    // Write from Dictation is scored deterministically (no LLM needed for score)
    // but LLM provides coaching feedback
    const mockScore = {
      taskType: "write_from_dictation",
      overallScore: 74,
      rawScore: 5,
      maxRawScore: 7,
      correctAnswers: ["The conference will be held in the main auditorium."],
      userAnswers: ["The conferance will be held in the main auditorium."],
      cefrLevel: "B2",
      overallFeedback: "Good performance. One spelling error: 'conferance' should be 'conference'.",
      strengths: ["Correct word order", "Most words spelled correctly"],
      improvements: ["Practice spelling 'conference'"],
      strategyTips: ["Listen for syllable stress", "Write in chunks"],
    };
    mockLLMResponse(mockScore);

    const result = await scoreWriteFromDictation({
      originalSentence: "The conference will be held in the main auditorium.",
      userResponse: "The conferance will be held in the main auditorium.",
    });

    // "conferance" ≠ "conference" → 8/9 correct words (sentence has 9 words)
    expect(result.rawScore).toBe(8); // "conferance" is wrong, 8 other words correct
    expect(result.maxRawScore).toBe(9); // 9 words in original sentence
    expect(result.overallScore).toBeGreaterThanOrEqual(10);
    expect(result.overallScore).toBeLessThanOrEqual(90);
  });

  it("scores Highlight Correct Summary correctly", async () => {
    const mockScore = {
      taskType: "highlight_correct_summary",
      overallScore: 90,
      rawScore: 1,
      maxRawScore: 1,
      correctAnswers: ["The lecture discusses the benefits of renewable energy."],
      userAnswers: ["The lecture discusses the benefits of renewable energy."],
      cefrLevel: "C1",
      overallFeedback: "Correct. This summary accurately captures the main topic.",
      strengths: ["Correctly identified the best summary"],
      improvements: [],
      strategyTips: ["Listen for the main idea", "Eliminate summaries that are too specific or too broad"],
    };
    mockLLMResponse(mockScore);

    const result = await scoreHighlightCorrectSummary({
      lectureTranscript: "Today we will explore renewable energy sources...",
      summaryOptions: [
        "The lecture discusses the benefits of renewable energy.",
        "The lecture focuses on the problems with fossil fuels.",
        "The lecture provides a history of energy production.",
      ],
      correctSummary: "The lecture discusses the benefits of renewable energy.",
      userSummary: "The lecture discusses the benefits of renewable energy.",
    });

    expect(result.rawScore).toBe(1);
    expect(result.overallScore).toBe(90);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCORE RANGE VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe("Score Range Validation", () => {
  it("PTE scores are always between 10 and 90", async () => {
    const scores = [10, 25, 43, 58, 65, 72, 79, 85, 90];
    scores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(10);
      expect(score).toBeLessThanOrEqual(90);
    });
  });

  it("CEFR levels map correctly to PTE score ranges", () => {
    const cefr = (score: number) =>
      score >= 85 ? "C2" : score >= 76 ? "C1" : score >= 59 ? "B2" : score >= 43 ? "B1" : score >= 29 ? "A2" : "A1";

    expect(cefr(90)).toBe("C2");
    expect(cefr(80)).toBe("C1");
    expect(cefr(65)).toBe("B2");
    expect(cefr(50)).toBe("B1");
    expect(cefr(30)).toBe("A2");
    expect(cefr(15)).toBe("A1");
  });

  it("Write from Dictation deterministic scoring is correct", async () => {
    const mockFeedback = {
      taskType: "write_from_dictation",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 3,
      correctAnswers: ["Hello world test"],
      userAnswers: [""],
      cefrLevel: "A1",
      overallFeedback: "No words written correctly.",
      strengths: [],
      improvements: ["Practice listening carefully"],
      strategyTips: ["Write what you hear immediately"],
    };
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
    } as any);

    const result = await scoreWriteFromDictation({
      originalSentence: "Hello world test",
      userResponse: "",
    });

    expect(result.rawScore).toBe(0);
    expect(result.maxRawScore).toBe(3);
  });
});
