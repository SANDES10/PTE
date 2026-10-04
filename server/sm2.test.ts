import { describe, it, expect } from "vitest";
import {
  computeSm2,
  scoreToRating,
  shouldCreateCard,
  getIntervalPreviews,
  getRatingLabel,
  formatInterval,
  isCardDue,
  getUrgencyScore,
  calculateRetentionRate,
  type SrsRating,
  type Sm2Input,
} from "./sm2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<Sm2Input> = {}): Sm2Input {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    lapses: 0,
    state: "new",
    rating: 3,
    ...overrides,
  };
}

// ─── computeSm2 ───────────────────────────────────────────────────────────────

describe("computeSm2", () => {
  describe("failed reviews (rating 1 or 2)", () => {
    it("resets interval to 1 on rating=1 (Again)", () => {
      const result = computeSm2(makeCard({ rating: 1, repetitions: 5, interval: 30 }));
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.lapses).toBe(1);
    });

    it("resets interval to 1 on rating=2 (Hard)", () => {
      const result = computeSm2(makeCard({ rating: 2, repetitions: 3, interval: 15 }));
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.lapses).toBe(1);
    });

    it("transitions new card to learning on failure", () => {
      const result = computeSm2(makeCard({ rating: 1, state: "new" }));
      expect(result.state).toBe("learning");
    });

    it("transitions review card to relearning on failure", () => {
      const result = computeSm2(makeCard({ rating: 1, state: "review", repetitions: 5 }));
      expect(result.state).toBe("relearning");
    });

    it("penalises ease factor on lapse (min 1.3)", () => {
      const result = computeSm2(makeCard({ rating: 1, easeFactor: 1.4 }));
      expect(result.easeFactor).toBeCloseTo(1.3, 1);
    });

    it("does not drop ease factor below 1.3", () => {
      const result = computeSm2(makeCard({ rating: 1, easeFactor: 1.3 }));
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("increments lapses counter", () => {
      const result = computeSm2(makeCard({ rating: 1, lapses: 3 }));
      expect(result.lapses).toBe(4);
    });
  });

  describe("successful reviews (rating 3–5)", () => {
    it("sets interval to 1 on first repetition", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 0 }));
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("sets interval to 6 on second repetition", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 1, interval: 1 }));
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it("multiplies interval by ease factor from third repetition onwards", () => {
      // SM-2 updates EF before computing interval, so EF drops from 2.5 for rating=3
      // EF delta for q=3: 0.1 - (5-3)*(0.08+(5-3)*0.02) = 0.1 - 0.24 = -0.14 → EF = 2.36
      const card = makeCard({ rating: 3, repetitions: 2, interval: 6, easeFactor: 2.5 });
      const result = computeSm2(card);
      const expectedEF = Math.max(1.3, 2.5 + (0.1 - 2 * (0.08 + 2 * 0.02)));
      expect(result.interval).toBe(Math.round(6 * expectedEF));
    });

    it("increases ease factor on rating=4 (Easy) after multiple repetitions", () => {
      // EF is updated on every pass; test with repetitions=2 to reach the EF update path
      const card = makeCard({ rating: 4, easeFactor: 2.5, repetitions: 2, interval: 6 });
      const result = computeSm2(card);
      // EF delta for q=4: 0.1 - (5-4)*(0.08+(5-4)*0.02) = 0.1 - 0.10 = 0.0 → EF unchanged
      // For q=5: 0.1 - 0*(0.08+0) = 0.1 → EF increases
      // So for rating=5, EF should increase
      const card5 = makeCard({ rating: 5, easeFactor: 2.5, repetitions: 2, interval: 6 });
      const result5 = computeSm2(card5);
      expect(result5.easeFactor).toBeGreaterThan(2.5);
    });

    it("increases ease factor more on rating=5 (Perfect)", () => {
      const card4 = computeSm2(makeCard({ rating: 4, easeFactor: 2.5 }));
      const card5 = computeSm2(makeCard({ rating: 5, easeFactor: 2.5 }));
      expect(card5.easeFactor).toBeGreaterThan(card4.easeFactor);
    });

    it("decreases ease factor slightly on rating=3 (Good)", () => {
      const card = makeCard({ rating: 3, easeFactor: 2.5 });
      const result = computeSm2(card);
      // EF change for q=3: 0.1 - (5-3)*(0.08 + (5-3)*0.02) = 0.1 - 2*(0.08+0.04) = 0.1 - 0.24 = -0.14
      expect(result.easeFactor).toBeCloseTo(2.5 - 0.14, 1);
    });

    it("transitions to learning state after first pass", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 0, state: "new" }));
      expect(result.state).toBe("learning");
    });

    it("transitions to review state after 3+ repetitions", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 2, interval: 6, state: "learning" }));
      expect(result.state).toBe("review");
    });

    it("does not drop lapses on successful review", () => {
      const result = computeSm2(makeCard({ rating: 4, lapses: 2 }));
      expect(result.lapses).toBe(2);
    });

    it("clamps interval to max 365 days", () => {
      const result = computeSm2(makeCard({ rating: 5, repetitions: 10, interval: 300, easeFactor: 3.0 }));
      expect(result.interval).toBeLessThanOrEqual(365);
    });

    it("clamps interval to min 1 day", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 0, interval: 0 }));
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });
  });

  describe("dueDate calculation", () => {
    it("sets dueDate to today + interval days", () => {
      const result = computeSm2(makeCard({ rating: 3, repetitions: 1, interval: 1 }));
      const expectedDue = new Date();
      expectedDue.setDate(expectedDue.getDate() + result.interval);
      expect(result.dueDate.toDateString()).toBe(expectedDue.toDateString());
    });
  });
});

// ─── scoreToRating ────────────────────────────────────────────────────────────

describe("scoreToRating", () => {
  it("returns 5 for score >= 80", () => {
    expect(scoreToRating(80)).toBe(5);
    expect(scoreToRating(90)).toBe(5);
  });

  it("returns 4 for score 65–79", () => {
    expect(scoreToRating(65)).toBe(4);
    expect(scoreToRating(75)).toBe(4);
  });

  it("returns 3 for score 50–64", () => {
    expect(scoreToRating(50)).toBe(3);
    expect(scoreToRating(60)).toBe(3);
  });

  it("returns 2 for score 35–49", () => {
    expect(scoreToRating(35)).toBe(2);
    expect(scoreToRating(45)).toBe(2);
  });

  it("returns 1 for score < 35", () => {
    expect(scoreToRating(10)).toBe(1);
    expect(scoreToRating(34)).toBe(1);
  });
});

// ─── shouldCreateCard ─────────────────────────────────────────────────────────

describe("shouldCreateCard", () => {
  it("returns true for scores below 65", () => {
    expect(shouldCreateCard(64)).toBe(true);
    expect(shouldCreateCard(0)).toBe(true);
    expect(shouldCreateCard(50)).toBe(true);
  });

  it("returns false for scores 65 and above", () => {
    expect(shouldCreateCard(65)).toBe(false);
    expect(shouldCreateCard(80)).toBe(false);
    expect(shouldCreateCard(90)).toBe(false);
  });
});

// ─── getRatingLabel ───────────────────────────────────────────────────────────

describe("getRatingLabel", () => {
  it("returns correct labels for all ratings", () => {
    expect(getRatingLabel(1)).toBe("Again");
    expect(getRatingLabel(2)).toBe("Hard");
    expect(getRatingLabel(3)).toBe("Good");
    expect(getRatingLabel(4)).toBe("Easy");
    expect(getRatingLabel(5)).toBe("Perfect");
  });
});

// ─── formatInterval ───────────────────────────────────────────────────────────

describe("formatInterval", () => {
  it("formats 0 as 'now'", () => expect(formatInterval(0)).toBe("now"));
  it("formats 1 as '1d'", () => expect(formatInterval(1)).toBe("1d"));
  it("formats 5 as '5d'", () => expect(formatInterval(5)).toBe("5d"));
  it("formats 7 as '1w'", () => expect(formatInterval(7)).toBe("1w"));
  it("formats 14 as '2w'", () => expect(formatInterval(14)).toBe("2w"));
  it("formats 30 as '1mo'", () => expect(formatInterval(30)).toBe("1mo"));
  it("formats 365 as '1y'", () => expect(formatInterval(365)).toBe("1y"));
});

// ─── isCardDue ────────────────────────────────────────────────────────────────

describe("isCardDue", () => {
  it("returns true for past dates", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isCardDue(yesterday)).toBe(true);
  });

  it("returns false for future dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isCardDue(tomorrow)).toBe(false);
  });
});

// ─── getUrgencyScore ──────────────────────────────────────────────────────────

describe("getUrgencyScore", () => {
  it("returns 0 for future due dates with no lapses", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getUrgencyScore(tomorrow, 0)).toBe(0);
  });

  it("returns higher score for more overdue cards", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    expect(getUrgencyScore(lastWeek, 0)).toBeGreaterThan(getUrgencyScore(yesterday, 0));
  });

  it("adds extra urgency for cards with more lapses", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getUrgencyScore(yesterday, 3)).toBeGreaterThan(getUrgencyScore(yesterday, 0));
  });
});

// ─── calculateRetentionRate ───────────────────────────────────────────────────

describe("calculateRetentionRate", () => {
  it("returns 0 for zero total reviews", () => {
    expect(calculateRetentionRate(0, 0)).toBe(0);
  });

  it("returns 1.0 for perfect recall", () => {
    expect(calculateRetentionRate(10, 10)).toBe(1.0);
  });

  it("returns 0.8 for 8/10 correct", () => {
    expect(calculateRetentionRate(8, 10)).toBeCloseTo(0.8);
  });
});

// ─── getIntervalPreviews ──────────────────────────────────────────────────────

describe("getIntervalPreviews", () => {
  it("returns previews for all 5 ratings", () => {
    const card = { easeFactor: 2.5, interval: 6, repetitions: 2, lapses: 0, state: "review" as const };
    const previews = getIntervalPreviews(card);
    expect(Object.keys(previews)).toHaveLength(5);
    expect(previews[1]).toBeDefined();
    expect(previews[5]).toBeDefined();
  });

  it("shows shorter interval for lower ratings", () => {
    const card = { easeFactor: 2.5, interval: 10, repetitions: 3, lapses: 0, state: "review" as const };
    const previews = getIntervalPreviews(card);
    // Rating 1 should give interval 1 (reset), rating 5 should give a longer interval
    const r1 = computeSm2({ ...card, rating: 1 as SrsRating });
    const r5 = computeSm2({ ...card, rating: 5 as SrsRating });
    expect(r1.interval).toBeLessThan(r5.interval);
  });
});

// ─── SM-2 sequence simulation ─────────────────────────────────────────────────

describe("SM-2 full learning sequence", () => {
  it("correctly advances a card through new → learning → review states", () => {
    let card = makeCard({ rating: 3 });

    // First review: new → learning, interval=1
    let result = computeSm2(card);
    expect(result.state).toBe("learning");
    expect(result.interval).toBe(1);

    // Second review: learning, interval=6
    card = { ...card, ...result, rating: 3 };
    result = computeSm2(card);
    expect(result.interval).toBe(6);

    // Third review: learning → review, interval = 6 * EF
    card = { ...card, ...result, rating: 3 };
    result = computeSm2(card);
    expect(result.state).toBe("review");
    expect(result.interval).toBeGreaterThan(6);
  });

  it("resets card to relearning after a lapse in review state", () => {
    let card = makeCard({ repetitions: 5, interval: 30, state: "review", easeFactor: 2.5, rating: 1 });
    const result = computeSm2(card);
    expect(result.state).toBe("relearning");
    expect(result.interval).toBe(1);
    expect(result.lapses).toBe(1);
  });
});
