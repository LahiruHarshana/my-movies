import { describe, it, expect } from "vitest";
import {
  parseRecommendationFilters,
  hasActiveFilters,
  buildDiscoverParams,
  getFilteredDiscoverSorts,
  movieMatchesFilters,
  getFilterSummaryChips,
  getFilterMatchReason,
} from "./filters";
import { TMDBMovie } from "@/types/movie";

function mockMovie(overrides: Partial<TMDBMovie> = {}): TMDBMovie {
  return {
    id: 1,
    title: "Test",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2015-06-01",
    vote_average: 8.2,
    vote_count: 500,
    genre_ids: [28, 878],
    popularity: 100,
    original_language: "ta",
    adult: false,
    ...overrides,
  };
}

describe("parseRecommendationFilters", () => {
  it("parses URL search params", () => {
    const filters = parseRecommendationFilters({
      genre: "28",
      year: "2020",
      language: "ta",
      rating: "8",
      sort: "vote_average.desc",
    });

    expect(filters).toEqual({
      genre: "28",
      year: "2020",
      language: "ta",
      rating: "8",
      sort: "vote_average.desc",
    });
  });

  it("returns undefined for empty params", () => {
    const filters = parseRecommendationFilters({});
    expect(hasActiveFilters(filters)).toBe(false);
  });
});

describe("hasActiveFilters", () => {
  it("is true when sort is set", () => {
    expect(hasActiveFilters({ sort: "popularity.desc" })).toBe(true);
  });
});

describe("buildDiscoverParams", () => {
  it("maps filters to TMDB discover params", () => {
    const params = buildDiscoverParams({
      genre: "28",
      year: "2010-2019",
      language: "ta",
      rating: "8",
      sort: "vote_average.desc",
    });

    expect(params.with_genres).toBe("28");
    expect(params["primary_release_date.gte"]).toBe("2010-01-01");
    expect(params["primary_release_date.lte"]).toBe("2019-12-31");
    expect(params.with_original_language).toBe("ta");
    expect(params["vote_average.gte"]).toBe("8");
    expect(params.sort_by).toBe("vote_average.desc");
    expect(params.include_adult).toBe("false");
    expect(params["vote_count.gte"]).toBe("5");
    expect(params.with_origin_country).toBe("IN");
  });

  it("uses lower vote floor for non-rating sorts", () => {
    const params = buildDiscoverParams({ sort: "popularity.desc" });
    expect(params["vote_count.gte"]).toBe("50");
  });

  it("includes Chinese language and regional vote floor", () => {
    const params = buildDiscoverParams({ language: "zh", sort: "popularity.desc" });
    expect(params.with_original_language).toBe("zh");
    expect(params["vote_count.gte"]).toBe("5");
    expect(params.with_origin_country).toBeUndefined();
  });

  it("returns multiple sorts for regional language filters", () => {
    const sorts = getFilteredDiscoverSorts({ language: "ta" });
    expect(sorts).toContain("popularity.desc");
    expect(sorts).toContain("vote_average.desc");
  });
});

describe("movieMatchesFilters", () => {
  it("accepts movies matching all filters", () => {
    const movie = mockMovie();
    expect(
      movieMatchesFilters(movie, {
        genre: "28",
        year: "2010-2019",
        language: "ta",
        rating: "8",
      })
    ).toBe(true);
  });

  it("rejects movies outside genre filter", () => {
    const movie = mockMovie({ genre_ids: [18] });
    expect(movieMatchesFilters(movie, { genre: "28" })).toBe(false);
  });

  it("rejects movies below rating threshold", () => {
    const movie = mockMovie({ vote_average: 6.5 });
    expect(movieMatchesFilters(movie, { rating: "8" })).toBe(false);
  });
});

describe("filter labels", () => {
  it("builds summary chips", () => {
    const chips = getFilterSummaryChips(
      { language: "ta", year: "2020", rating: "8", genre: "28" },
      "Action"
    );
    expect(chips).toContain("Action");
    expect(chips).toContain("Tamil");
    expect(chips).toContain("2020");
    expect(chips).toContain("8+ rating");
  });

  it("builds filter match reason", () => {
    const reason = getFilterMatchReason({ language: "ta", rating: "8" }, "Action");
    expect(reason).toContain("Tamil");
    expect(reason).toContain("8+");
  });
});
