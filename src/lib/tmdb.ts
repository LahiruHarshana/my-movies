import { TMDBMovie, TMDBMovieDetails, TMDBPaginatedResponse, TMDBCast, TMDBCrew, TMDBGenre } from "@/types/movie";

const BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

/**
 * Core fetch wrapper for TMDB API
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
  if (!BEARER_TOKEN) {
    throw new Error("TMDB_BEARER_TOKEN is not defined in environment variables");
  }

  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
    next: { revalidate }, // Next.js cache configuration
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get Image URL
 */
export function getImageUrl(
  path: string | null,
  size:
    | "w92"
    | "w154"
    | "w185"
    | "w342"
    | "w500"
    | "w780"
    | "w1280"
    | "h632"
    | "original" = "w500"
): string {
  if (!path) return "/placeholder-poster.png";
  const imageBase = process.env.TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";
  return `${imageBase}/${size}${path}`;
}

// ==========================================
// API Endpoints
// ==========================================

export async function searchMovies(query: string, page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  // We use revalidate: 0 for search to get real-time results
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>("/search/movie", { query, page: page.toString(), include_adult: "false" }, 0);
}

export async function getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
  // Cache for 24 hours
  return tmdbFetch<TMDBMovieDetails>(`/movie/${tmdbId}`, {}, 86400);
}

export async function getMovieCredits(tmdbId: number): Promise<{ cast: TMDBCast[]; crew: TMDBCrew[] }> {
  return tmdbFetch<{ cast: TMDBCast[]; crew: TMDBCrew[] }>(`/movie/${tmdbId}/credits`, {}, 86400);
}

export async function getMovieRecommendations(tmdbId: number, page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${tmdbId}/recommendations`, { page: page.toString() }, 86400);
}

export async function getSimilarMovies(tmdbId: number, page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${tmdbId}/similar`, { page: page.toString() }, 86400);
}

export async function getTrendingMovies(window: "day" | "week" = "week", page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  // Revalidate trending every hour
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>(`/trending/movie/${window}`, { page: page.toString() }, 3600);
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>("/movie/top_rated", { page: page.toString() }, 86400);
}

export async function discoverMovies(params: Record<string, string>): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>("/discover/movie", params, 86400);
}

export async function getGenreList(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list", {}, 86400 * 7); // Cache for a week
}


export async function getPersonDetails(personId: number) {
  return tmdbFetch<any>(`/person/${personId}`, {}, 86400 * 7); // Cache for 7 days
}

export async function getPersonMovieCredits(personId: number) {
  return tmdbFetch<any>(`/person/${personId}/movie_credits`, {}, 86400 * 7);
}
