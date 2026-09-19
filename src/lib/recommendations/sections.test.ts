import { describe, it, expect } from "vitest";
import { buildSections } from "./sections";
import { buildTasteProfile } from "./taste-profile";
import type { ScoredCandidate } from "./types";
import { TMDBMovie } from "@/types/movie";

function scored(id: number, overrides: Partial<ScoredCandidate> = {}): ScoredCandidate {
  const movie: TMDBMovie = {
    id,
    title: `Movie ${id}`,
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2015-01-01",
    vote_average: 8.5,
    vote_count: 5000,
    genre_ids: [878],
    popularity: 100,
    original_language: "en",
    adult: false,
  };

  return {
    movie,
    score: 0.8,
    breakdown: {
      personalFit: 0.7,
      tmdbEvidence: 0.6,
      quality: 0.8,
      mustWatch: 0.75,
      explore: 0.1,
      total: 0.8,
    },
    reasons: ["Matches your Science Fiction taste"],
    sourceTags: ["genre_discover"],
    seedTitles: [],
    ...overrides,
  };
}

describe("buildSections", () => {
  const profile = buildTasteProfile(
    [{ tmdbId: 1, title: "Inception", genres: [{ id: 878, name: "Science Fiction" }], rating: 9, isFavorite: true }],
    [878],
    [],
    [50]
  );

  it("does not include a watch next section", () => {
    const sections = buildSections([scored(10), scored(11), scored(12)], profile);

    expect(sections.find((s) => s.id === "watch-next")).toBeUndefined();
  });

  it("never surfaces watchlist movies in discovery sections", () => {
    const sections = buildSections(
      [scored(10), scored(11), scored(50)],
      profile
    );

    const allMovieIds = sections.flatMap((section) => section.movies.map((movie) => movie.id));
    expect(allMovieIds).not.toContain(50);
  });

  it("builds because-you-loved rows from seed titles", () => {
    const sections = buildSections(
      [
        scored(20, { score: 0.5, breakdown: { personalFit: 0.4, tmdbEvidence: 0.3, quality: 0.5, mustWatch: 0.4, explore: 0.1, total: 0.5 } }),
        scored(21, { seedTitles: ["Inception"], sourceTags: ["item_recommendation"] }),
      ],
      profile
    );

    expect(sections.some((s) => s.id === "because-1")).toBe(true);
    expect(sections.find((s) => s.id === "because-1")?.movies.some((m) => m.id === 21)).toBe(true);
  });
});
