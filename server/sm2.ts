/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak (1987).
 * Adapted for PTE Academic practice with a 1–5 quality rating scale.
 *
 * Rating scale:
 *   1 = Again   — complete blackout / wrong answer, restart learning
 *   2 = Hard    — incorrect but remembered with significant difficulty
 *   3 = Good    — correct with some difficulty
 *   4 = Easy    — correct with minor hesitation
 *   5 = Perfect — perfect recall, no hesitation
 *
 * Intervals:
 *   - Repetition 0 (new):    1 day
 *   - Repetition 1:          6 days
 *   - Repetition n (n >= 2): interval(n-1) * easeFactor
 *
 * EaseFactor update:
 *   EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 *   EF minimum = 1.3
 */

export type SrsRating = 1 | 2 | 3 | 4 | 5;

export type CardState = "new" | "learning" | "review" | "relearning";

export interface Sm2Input {
  easeFactor: number;    // current ease factor (default 2.5)
  interval: number;      // current interval in days
  repetitions: number;   // consecutive successful reviews
  lapses: number;        // total times the card was forgotten
  state: CardState;
  rating: SrsRating;     // quality of recall: 1–5
}

export interface Sm2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  state: CardState;
  dueDate: Date;         // absolute date for next review
}

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

/**
 * Compute the next SM-2 state for a card given a user's rating.
 */
export function computeSm2(input: Sm2Input): Sm2Output {
  const { rating } = input;
  let { easeFactor, interval, repetitions, lapses, state } = input;

  const isPass = rating >= 3;

  if (!isPass) {
    // Card failed — reset to learning/relearning
    lapses += 1;
    repetitions = 0;
    interval = 1; // review again tomorrow
    const newState: CardState = state === "new" ? "learning" : "relearning";

    // Penalise ease factor on lapse
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);

    return {
      easeFactor,
      interval,
      repetitions,
      lapses,
      state: newState,
      dueDate: addDays(new Date(), interval),
    };
  }

  // Card passed — advance through SM-2 schedule
  repetitions += 1;

  // Update ease factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  const q = rating;
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + efDelta);

  // Calculate next interval
  if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor);
  }

  // Clamp interval to reasonable bounds
  interval = Math.max(1, Math.min(interval, 365));

  // Determine new state
  let newState: CardState;
  if (repetitions <= 2) {
    newState = "learning";
  } else {
    newState = "review";
  }

  return {
    easeFactor,
    interval,
    repetitions,
    lapses,
    state: newState,
    dueDate: addDays(new Date(), interval),
  };
}

/**
 * Convert a normalized PTE score (10–90) to an SRS rating (1–5).
 * Used when auto-creating cards from failed practice responses.
 */
export function scoreToRating(normalizedScore: number): SrsRating {
  if (normalizedScore >= 80) return 5;
  if (normalizedScore >= 65) return 4;
  if (normalizedScore >= 50) return 3;
  if (normalizedScore >= 35) return 2;
  return 1;
}

/**
 * Determine if a response should trigger an SRS card creation.
 * Cards are created for responses scoring below 65 (below "Good").
 */
export function shouldCreateCard(normalizedScore: number): boolean {
  return normalizedScore < 65;
}

/**
 * Calculate retention rate from review history.
 * Returns a value between 0 and 1.
 */
export function calculateRetentionRate(
  correctReviews: number,
  totalReviews: number
): number {
  if (totalReviews === 0) return 0;
  return correctReviews / totalReviews;
}

/**
 * Get a human-readable label for an SRS rating.
 */
export function getRatingLabel(rating: SrsRating): string {
  const labels: Record<SrsRating, string> = {
    1: "Again",
    2: "Hard",
    3: "Good",
    4: "Easy",
    5: "Perfect",
  };
  return labels[rating];
}

/**
 * Get the colour class for an SRS rating (for UI).
 */
export function getRatingColor(rating: SrsRating): string {
  const colors: Record<SrsRating, string> = {
    1: "#ef4444", // red
    2: "#f97316", // orange
    3: "#3b82f6", // blue
    4: "#10b981", // green
    5: "#0d9488", // teal
  };
  return colors[rating];
}

/**
 * Get the next review interval preview for each rating button.
 * Used to show "Again → 1d", "Hard → 2d", etc. in the UI.
 */
export function getIntervalPreviews(
  card: Pick<Sm2Input, "easeFactor" | "interval" | "repetitions" | "lapses" | "state">
): Record<SrsRating, string> {
  const ratings: SrsRating[] = [1, 2, 3, 4, 5];
  const result = {} as Record<SrsRating, string>;

  for (const rating of ratings) {
    const output = computeSm2({ ...card, rating });
    result[rating] = formatInterval(output.interval);
  }

  return result;
}

/**
 * Format an interval in days to a human-readable string.
 */
export function formatInterval(days: number): string {
  if (days === 0) return "now";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

/**
 * Add N days to a date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a card is due for review (dueDate <= now).
 */
export function isCardDue(dueDate: Date): boolean {
  return new Date() >= dueDate;
}

/**
 * Calculate the "urgency score" for prioritising due cards.
 * Cards that are more overdue get higher priority.
 */
export function getUrgencyScore(dueDate: Date, lapses: number): number {
  const now = new Date();
  const overdueDays = Math.max(0, (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return overdueDays + lapses * 2; // lapses add extra urgency
}
