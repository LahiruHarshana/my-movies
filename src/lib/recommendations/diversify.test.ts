import { describe, it, expect } from "vitest";
import { diversifyResults } from "./diversify";
import type { ScoredCandidate } from "./types";
import { TMDBMovie } from "@/types/movie";

function candidate(id: number, genreIds: number[], score: number): ScoredCandidate {
  const movie: TMDBMovie = {
    id,
    title: `Movie ${id}`,
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2000-01-01",
    vote_average: 8,
    vote_count: 1000,
    genre_ids: genreIds,
    popularity: 50,
    original_language: "en",
    adult: false,
  };

  return {
    movie,
    score,
    breakdown: {
      personalFit: score,
      tmdbEvidence: 0.5,
      quality: 0.7,
      mustWatch: 0.6,
      explore: 0,
      total: score,
    },
    reasons: [],
    sourceTags: ["genre_discover"],
    seedTitles: [],
  };
}

describe("diversifyResults", () => {
  it("limits same-genre dominance", () => {
    const pool = [
      candidate(1, [878], 0.9),
      candidate(2, [878], 0.88),
      candidate(3, [878], 0.87),
      candidate(4, [878], 0.86),
      candidate(5, [878], 0.85),
      candidate(6, [18], 0.84),
    ];

    const diversified = diversifyResults(pool, 4);
    const sciFiCount = diversified.filter((c) => c.movie.genre_ids.includes(878)).length;

    expect(diversified).toHaveLength(4);
    expect(sciFiCount).toBeLessThan(4);
  });

  it("is deterministic for equal inputs", () => {
    const pool = [candidate(1, [28], 0.9), candidate(2, [12], 0.8), candidate(3, [18], 0.7)];
    const first = diversifyResults(pool, 2).map((c) => c.movie.id);
    const second = diversifyResults(pool, 2).map((c) => c.movie.id);
    expect(first).toEqual(second);
  });
});
