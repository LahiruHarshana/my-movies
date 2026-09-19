import { describe, it, expect } from "vitest";
import { buildTasteProfile } from "./taste-profile";
import { mergeCandidates, scoreCandidates } from "./scoring";
import { diversifyResults } from "./diversify";
import { buildFilteredSection } from "./sections";
import { TMDBMovie } from "@/types/movie";

function mockMovie(id: number, overrides: Partial<TMDBMovie> = {}): TMDBMovie {
  return {
    id,
    title: `Movie ${id}`,
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2020-01-01",
    vote_average: 8.5,
    vote_count: 2000,
    genre_ids: [28],
    popularity: 100,
    original_language: "en",
    adult: false,
    ...overrides,
  };
}

describe("filtered recommendation pipeline", () => {
  const profile = buildTasteProfile(
    [{ tmdbId: 1, title: "Watched", genres: [{ id: 28, name: "Action" }], rating: 9 }],
    [],
    [],
    []
  );

  it("excludes watched movies from filtered results", () => {
    const raw = [
      { movie: mockMovie(1), source: "filtered_discover" as const, rank: 1 },
      { movie: mockMovie(2), source: "filtered_discover" as const, rank: 2 },
      { movie: mockMovie(3), source: "filtered_discover" as const, rank: 3 },
    ];

    const scored = scoreCandidates(mergeCandidates(raw), profile);
    const diversified = diversifyResults(scored, 10);
    const filtered = buildFilteredSection(
      diversified,
      profile,
      { genre: "28", rating: "8" },
      "Action"
    );

    expect(filtered.some((m) => m.id === 1)).toBe(false);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].reasons[0]).toContain("Matches");
  });

  it("returns deterministic ordering for equal inputs", () => {
    const raw = [
      { movie: mockMovie(10, { vote_average: 9 }), source: "filtered_discover" as const, rank: 1 },
      { movie: mockMovie(11, { vote_average: 8.8 }), source: "filtered_discover" as const, rank: 2 },
    ];

    const scoreOnce = () => {
      const scored = scoreCandidates(mergeCandidates(raw), profile);
      return diversifyResults(scored, 2).map((c) => c.movie.id);
    };

    expect(scoreOnce()).toEqual(scoreOnce());
  });
});
