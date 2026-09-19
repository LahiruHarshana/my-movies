import { TMDBMovie } from "@/types/movie";
import type { RecommendationFilters } from "./types";
import {
  applyYearToDiscoverParams,
  getYearFilterLabel,
  releaseDateMatchesYearFilter,
} from "@/lib/year-filters";

/** ISO 639-1 codes where TMDB vote counts are typically much lower than Hollywood. */
export const REGIONAL_LANGUAGE_CODES = new Set([
  "ta",
  "te",
  "hi",
  "ml",
  "kn",
  "bn",
  "mr",
  "zh",
  "ko",
  "ja",
]);

/** Indian production languages — also constrain by origin country for better TMDB coverage. */
export const INDIAN_LANGUAGE_CODES = new Set(["ta", "te", "hi", "ml", "kn", "bn", "mr"]);

export const LANGUAGE_LABELS: Record<string, string> = {
  ta: "Tamil",
  te: "Telugu",
  hi: "Hindi",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  mr: "Marathi",
  zh: "Chinese",
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  fr: "French",
  es: "Spanish",
};

export function isRegionalLanguage(code?: string): boolean {
  return code ? REGIONAL_LANGUAGE_CODES.has(code) : false;
}

export function isIndianLanguage(code?: string): boolean {
  return code ? INDIAN_LANGUAGE_CODES.has(code) : false;
}

export function getVoteCountFloor(language?: string, sort?: string): string {
  if (isRegionalLanguage(language)) return "5";
  if (sort?.startsWith("vote_average")) return "100";
  return "50";
}

export function parseRecommendationFilters(
  searchParams: Record<string, string | undefined>
): RecommendationFilters {
  return {
    genre: searchParams.genre || undefined,
    year: searchParams.year || undefined,
    language: searchParams.language || undefined,
    rating: searchParams.rating || undefined,
    sort: searchParams.sort || undefined,
  };
}

export function hasActiveFilters(filters?: RecommendationFilters): boolean {
  if (!filters) return false;
  return !!(filters.genre || filters.year || filters.language || filters.rating || filters.sort);
}

export function buildDiscoverParams(
  filters: RecommendationFilters,
  page = 1,
  sortOverride?: string
): Record<string, string> {
  const sort = sortOverride || filters.sort || (isRegionalLanguage(filters.language) ? "popularity.desc" : "vote_average.desc");
  const voteLimit = getVoteCountFloor(filters.language, sort);

  const params: Record<string, string> = {
    sort_by: sort,
    page: page.toString(),
    "vote_count.gte": voteLimit,
    include_adult: "false",
  };

  if (filters.genre) params.with_genres = filters.genre;
  if (filters.year) applyYearToDiscoverParams(params, filters.year);
  if (filters.language) {
    params.with_original_language = filters.language;
    if (isIndianLanguage(filters.language)) {
      params.with_origin_country = "IN";
    }
  }
  if (filters.rating) params["vote_average.gte"] = filters.rating;

  return params;
}

export function getFilteredDiscoverSorts(filters: RecommendationFilters): string[] {
  if (!isRegionalLanguage(filters.language)) {
    return [filters.sort || "vote_average.desc"];
  }

  const primary = filters.sort || "popularity.desc";
  const alternates = ["popularity.desc", "vote_average.desc", "primary_release_date.desc"];
  return [primary, ...alternates.filter((sort) => sort !== primary)];
}

export function getFilteredPageCount(filters: RecommendationFilters, defaultPages: number): number {
  return isRegionalLanguage(filters.language) ? Math.max(defaultPages, 10) : defaultPages;
}

export function movieMatchesFilters(movie: TMDBMovie, filters: RecommendationFilters): boolean {
  if (filters.genre) {
    const genreId = parseInt(filters.genre, 10);
    if (!movie.genre_ids?.includes(genreId)) return false;
  }

  if (filters.year && !releaseDateMatchesYearFilter(movie.release_date, filters.year)) {
    return false;
  }

  // Trust TMDB discover when original_language is absent from list results.
  if (filters.language && movie.original_language) {
    if (movie.original_language !== filters.language) return false;
  }

  if (filters.rating) {
    const minRating = parseFloat(filters.rating);
    if ((movie.vote_average || 0) < minRating) return false;
  }

  return true;
}

export function getFilterSummaryChips(
  filters: RecommendationFilters,
  genreName?: string
): string[] {
  const chips: string[] = [];

  if (filters.genre && genreName) chips.push(genreName);
  if (filters.language) chips.push(LANGUAGE_LABELS[filters.language] || filters.language);
  if (filters.year) {
    const yearLabel = getYearFilterLabel(filters.year);
    if (yearLabel) chips.push(yearLabel);
  }
  if (filters.rating) chips.push(`${filters.rating}+ rating`);

  return chips;
}

export function getFilterMatchReason(filters: RecommendationFilters, genreName?: string): string {
  const parts: string[] = [];

  if (filters.language) {
    parts.push(LANGUAGE_LABELS[filters.language] || filters.language);
  }
  if (genreName) parts.push(genreName);
  if (filters.year) {
    const yearLabel = getYearFilterLabel(filters.year);
    if (yearLabel) parts.push(yearLabel);
  }
  if (filters.rating) parts.push(`${filters.rating}+`);

  if (parts.length === 0) return "Matches your filters";
  return `Matches ${parts.join(" · ")}`;
}
