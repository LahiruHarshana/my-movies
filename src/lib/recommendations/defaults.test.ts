import { describe, it, expect } from "vitest";
import { meetsDefaultRecommendationCriteria } from "./defaults";
import { TMDBMovie } from "@/types/movie";

function movie(overrides: Partial<TMDBMovie> = {}): TMDBMovie {
  return {
    id: 1,
    title: "Test",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2018-01-01",
    vote_average: 8,
    vote_count: 1000,
    genre_ids: [18],
    popularity: 50,
    original_language: "en",
    adult: false,
    ...overrides,
  };
}

describe("meetsDefaultRecommendationCriteria", () => {
  it("allows Indian and English films from 2010 onward", () => {
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "en" }))).toBe(true);
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "ta" }))).toBe(true);
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "hi" }))).toBe(true);
  });

  it("rejects pre-2010 films", () => {
    expect(meetsDefaultRecommendationCriteria(movie({ release_date: "1994-01-01" }))).toBe(false);
    expect(meetsDefaultRecommendationCriteria(movie({ release_date: "2008-01-01" }))).toBe(false);
  });

  it("rejects Chinese, Japanese, and Korean unless user filters", () => {
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "zh" }))).toBe(false);
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "ja" }))).toBe(false);
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "ko" }))).toBe(false);
  });

  it("rejects other non-primary languages", () => {
    expect(meetsDefaultRecommendationCriteria(movie({ original_language: "fr" }))).toBe(false);
  });
});
