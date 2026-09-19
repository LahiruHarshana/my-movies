import { describe, it, expect } from "vitest";
import { buildTasteProfile, getConfidenceMessage } from "./taste-profile";

describe("buildTasteProfile", () => {
  it("weights liked genres higher than disliked ones", () => {
    const profile = buildTasteProfile([
      {
        tmdbId: 1,
        title: "Loved Sci-Fi",
        genres: [{ id: 878, name: "Science Fiction" }],
        rating: 10,
      },
      {
        tmdbId: 2,
        title: "Disliked Drama",
        genres: [{ id: 18, name: "Drama" }],
        rating: 3,
      },
    ]);

    expect(profile.genreWeights[878]).toBeGreaterThan(profile.genreWeights[18] || 0);
    expect(profile.seedMovies[0]?.tmdbId).toBe(1);
  });

  it("treats unrated watches as weak evidence", () => {
    const profile = buildTasteProfile([
      {
        tmdbId: 1,
        title: "Unrated",
        genres: [{ id: 28, name: "Action" }],
      },
    ]);

    expect(profile.genreWeights[28]).toBeLessThan(1);
    expect(profile.confidence).toBe("low");
  });

  it("excludes dismissed and tracks watchlist ids", () => {
    const profile = buildTasteProfile([], [], [99], [42]);
    expect(profile.dismissedIds.has(99)).toBe(true);
    expect(profile.watchlistIds.has(42)).toBe(true);
  });
});

describe("getConfidenceMessage", () => {
  it("returns cold-start guidance when no history", () => {
    expect(getConfidenceMessage("low", 0)).toContain("favorite genres");
  });
});
