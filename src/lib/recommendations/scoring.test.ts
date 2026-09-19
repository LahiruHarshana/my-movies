import { describe, it, expect } from "vitest";
import { buildTasteProfile } from "./taste-profile";
import { mergeCandidates, scoreCandidates, genreJaccard } from "./scoring";
import { TMDBMovie } from "@/types/movie";

function mockMovie(overrides: Partial<TMDBMovie> = {}): TMDBMovie {
  return {
    id: 100,
    title: "Test Movie",
    overview: "Overview",
    poster_path: "/poster.jpg",
    backdrop_path: null,
    release_date: "1999-01-01",
    vote_average: 8.2,
    vote_count: 5000,
    genre_ids: [878, 12],
    popularity: 120,
    original_language: "en",
    adult: false,
    ...overrides,
  };
}

describe("scoreCandidates", () => {
  const profile = buildTasteProfile(
    [
      {
        tmdbId: 1,
        title: "Inception",
        genres: [{ id: 878, name: "Science Fiction" }],
        rating: 9,
        isFavorite: true,
      },
    ],
    [878],
    [200],
    [300]
  );

  it("excludes watched, watchlist, and dismissed movies", () => {
    const grouped = mergeCandidates([
      { movie: mockMovie({ id: 1 }), source: "top_rated", rank: 1 },
      { movie: mockMovie({ id: 200 }), source: "top_rated", rank: 2 },
      { movie: mockMovie({ id: 300 }), source: "top_rated", rank: 3 },
      { movie: mockMovie({ id: 400 }), source: "top_rated", rank: 4 },
    ]);

    const scored = scoreCandidates(grouped, profile);
    expect(scored.find((c) => c.movie.id === 1)).toBeUndefined();
    expect(scored.find((c) => c.movie.id === 200)).toBeUndefined();
    expect(scored.find((c) => c.movie.id === 300)).toBeUndefined();
    expect(scored.find((c) => c.movie.id === 400)).toBeDefined();
  });

  it("boosts genre matches and merges duplicate sources", () => {
    const movie = mockMovie({ id: 500, genre_ids: [878] });
    const grouped = mergeCandidates([
      { movie, source: "item_recommendation", rank: 1, seedTitle: "Inception" },
      { movie, source: "genre_discover", rank: 2 },
    ]);

    const scored = scoreCandidates(grouped, profile);
    expect(scored).toHaveLength(1);
    expect(scored[0].reasons.some((r) => r.includes("Science Fiction"))).toBe(true);
    expect(scored[0].sourceTags).toContain("item_recommendation");
  });

  it("prefers high vote_count for must-watch signal", () => {
    const lowVotes = scoreCandidates(
      mergeCandidates([
        { movie: mockMovie({ id: 10, vote_count: 20, vote_average: 9.5 }), source: "top_rated", rank: 1 },
      ]),
      profile
    )[0];

    const highVotes = scoreCandidates(
      mergeCandidates([
        { movie: mockMovie({ id: 11, vote_count: 12000, vote_average: 8.4 }), source: "top_rated", rank: 1 },
      ]),
      profile
    )[0];

    expect(highVotes.breakdown.mustWatch).toBeGreaterThan(lowVotes.breakdown.mustWatch);
  });
});

describe("genreJaccard", () => {
  it("returns 1 for identical genre sets", () => {
    expect(genreJaccard([1, 2], [1, 2])).toBe(1);
  });

  it("returns 0 for disjoint genre sets", () => {
    expect(genreJaccard([1], [2])).toBe(0);
  });
});
