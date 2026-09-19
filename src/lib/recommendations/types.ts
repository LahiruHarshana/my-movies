import { TMDBMovie } from "@/types/movie";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface WatchedInput {
  tmdbId: number;
  title: string;
  genres?: { id: number; name: string }[];
  rating?: number | null;
  voteAverage?: number | null;
  releaseDate?: string | null;
  isFavorite?: boolean;
  director?: string | null;
  cast?: string[];
}

export interface WatchlistInput {
  tmdbId: number;
  title: string;
  genres?: { id: number; name: string }[];
  voteAverage?: number | null;
  releaseDate?: string | null;
  priority: "high" | "medium" | "low";
}

export interface SeedMovie {
  tmdbId: number;
  title: string;
  score: number;
}

export interface TasteProfile {
  genreWeights: Record<number, number>;
  genreNames: Record<number, string>;
  decadeWeights: Record<string, number>;
  directorWeights: Record<string, number>;
  favoriteGenres: number[];
  seedMovies: SeedMovie[];
  watchedIds: Set<number>;
  watchlistIds: Set<number>;
  dismissedIds: Set<number>;
  totalWatched: number;
  avgRating: number;
  topGenreNames: string[];
  confidence: ConfidenceLevel;
}

export type CandidateSource =
  | "item_recommendation"
  | "genre_discover"
  | "top_rated"
  | "hidden_gem"
  | "trending"
  | "decade_essential"
  | "explore"
  | "filtered_discover"
  | "world_cinema";

export interface RecommendationFilters {
  genre?: string;
  year?: string;
  language?: string;
  rating?: string;
  sort?: string;
}

export interface RawCandidate {
  movie: TMDBMovie;
  source: CandidateSource;
  rank: number;
  seedTitle?: string;
}

export interface ScoreBreakdown {
  personalFit: number;
  tmdbEvidence: number;
  quality: number;
  mustWatch: number;
  explore: number;
  total: number;
}

export interface ScoredCandidate {
  movie: TMDBMovie;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  sourceTags: CandidateSource[];
  seedTitles: string[];
}

export interface RecommendationMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  overview: string;
  popularity: number;
  reasons: string[];
  score: number;
}

export interface RecommendationSection {
  id: string;
  title: string;
  description?: string;
  movies: RecommendationMovie[];
}

export interface TasteSummary {
  totalWatched: number;
  topGenres: string[];
  avgRating: string;
  confidence: ConfidenceLevel;
  confidenceMessage: string;
}

export interface RecommendationsResult {
  sections: RecommendationSection[];
  tasteSummary: TasteSummary;
  generatedAt: string;
  isFilteredMode: boolean;
  activeFilters?: RecommendationFilters;
  filterChips?: string[];
  filteredMovies?: RecommendationMovie[];
}
