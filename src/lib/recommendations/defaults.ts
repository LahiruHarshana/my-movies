import { TMDBMovie } from "@/types/movie";

/** Shown by default on /recommendations — Indian languages + English. */
export const DEFAULT_PRIMARY_LANGUAGE_CODES = new Set([
  "en",
  "ta",
  "te",
  "hi",
  "ml",
  "kn",
  "bn",
  "mr",
]);

/** Only surfaced when the user picks a language filter (Chinese, Japanese, Korean). */
export const FILTER_ONLY_LANGUAGE_CODES = new Set(["zh", "ja", "ko"]);

export const DEFAULT_MIN_RELEASE_YEAR = 2010;

export const DEFAULT_RELEASE_DATE_GTE = `${DEFAULT_MIN_RELEASE_YEAR}-01-01`;

export function isDefaultPrimaryLanguage(code?: string): boolean {
  if (!code) return true;
  return DEFAULT_PRIMARY_LANGUAGE_CODES.has(code);
}

export function isFilterOnlyLanguage(code?: string): boolean {
  return code ? FILTER_ONLY_LANGUAGE_CODES.has(code) : false;
}

export function getReleaseYear(releaseDate?: string): number | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return Number.isNaN(year) ? null : year;
}

export function meetsDefaultRecommendationCriteria(movie: TMDBMovie): boolean {
  const year = getReleaseYear(movie.release_date);
  if (year !== null && year < DEFAULT_MIN_RELEASE_YEAR) return false;

  if (movie.original_language && isFilterOnlyLanguage(movie.original_language)) {
    return false;
  }

  if (movie.original_language && !isDefaultPrimaryLanguage(movie.original_language)) {
    return false;
  }

  return true;
}

export function isIndianOrEnglishCinema(code?: string): boolean {
  return isDefaultPrimaryLanguage(code);
}
