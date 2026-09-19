import { connectDB } from "./mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import WatchlistMovie from "@/models/WatchlistMovie";
import User, { IUser } from "@/models/User";
import RecommendationFeedback from "@/models/RecommendationFeedback";
import { buildTasteProfile, getConfidenceMessage } from "./recommendations/taste-profile";
import {
  retrieveCandidates,
  retrieveColdStartCandidates,
  retrieveFilteredCandidates,
} from "./recommendations/retrieve";
import { mergeCandidates, scoreCandidates } from "./recommendations/scoring";
import { buildSections, buildFilteredSection } from "./recommendations/sections";
import { diversifyResults } from "./recommendations/diversify";
import {
  hasActiveFilters,
  getFilterSummaryChips,
  parseRecommendationFilters,
} from "./recommendations/filters";
import { RECOMMENDATION_LIMITS } from "./recommendations/constants";
import { meetsDefaultRecommendationCriteria } from "./recommendations/defaults";
import type {
  RecommendationsResult,
  RecommendationFilters,
  WatchedInput,
  WatchlistInput,
} from "./recommendations/types";

export type {
  RecommendationMovie,
  RecommendationSection,
  RecommendationsResult,
  TasteSummary,
  RecommendationFilters,
} from "./recommendations/types";

export { buildTasteProfile } from "./recommendations/taste-profile";
export {
  parseRecommendationFilters,
  hasActiveFilters,
  buildDiscoverParams,
  movieMatchesFilters,
  getFilterSummaryChips,
} from "./recommendations/filters";

export { scoreCandidates, mergeCandidates, genreJaccard } from "./recommendations/scoring";
export { diversifyResults } from "./recommendations/diversify";

export async function getRecommendations(
  userId: string,
  filters?: RecommendationFilters,
  genreName?: string
): Promise<RecommendationsResult> {
  await connectDB();

  const [user, watchedDocs, watchlistDocs, feedbackDocs] = await Promise.all([
    User.findById(userId).lean<IUser>(),
    WatchedMovie.find({ userId }).lean(),
    WatchlistMovie.find({ userId }).lean(),
    RecommendationFeedback.find({ userId, type: "not_interested" }).lean(),
  ]);

  const watched: WatchedInput[] = watchedDocs.map((movie) => ({
    tmdbId: movie.tmdbId,
    title: movie.title,
    genres: movie.genres,
    rating: movie.rating,
    voteAverage: movie.voteAverage,
    releaseDate: movie.releaseDate,
    isFavorite: movie.isFavorite,
    director: movie.director,
    cast: movie.cast,
  }));

  const watchlist: WatchlistInput[] = watchlistDocs.map((movie) => ({
    tmdbId: movie.tmdbId,
    title: movie.title,
    genres: movie.genres,
    voteAverage: movie.voteAverage,
    releaseDate: movie.releaseDate,
    priority: movie.priority,
  }));

  const dismissedIds = feedbackDocs.map((entry) => entry.tmdbId);
  const favoriteGenres = user?.favoriteGenres || [];

  const profile = buildTasteProfile(
    watched,
    favoriteGenres,
    dismissedIds,
    watchlist.map((movie) => movie.tmdbId)
  );

  const tasteSummary = {
    totalWatched: profile.totalWatched,
    topGenres: profile.topGenreNames,
    avgRating: profile.avgRating ? profile.avgRating.toFixed(1) : "N/A",
    confidence: profile.confidence,
    confidenceMessage: getConfidenceMessage(profile.confidence, profile.totalWatched),
  };

  const isFilteredMode = hasActiveFilters(filters);

  if (isFilteredMode && filters) {
    const rawCandidates = await retrieveFilteredCandidates(
      filters,
      RECOMMENDATION_LIMITS.FILTERED_TMDB_PAGES
    );
    const grouped = mergeCandidates(rawCandidates);
    const scored = scoreCandidates(grouped, profile);
    const diversified = diversifyResults(
      scored.filter(
        (candidate) =>
          !profile.watchedIds.has(candidate.movie.id) &&
          !profile.watchlistIds.has(candidate.movie.id) &&
          !profile.dismissedIds.has(candidate.movie.id)
      ),
      RECOMMENDATION_LIMITS.FILTERED_RESULTS
    );

    const filteredMovies = buildFilteredSection(diversified, profile, filters, genreName);

    return {
      sections: [],
      tasteSummary,
      generatedAt: new Date().toISOString(),
      isFilteredMode: true,
      activeFilters: filters,
      filterChips: getFilterSummaryChips(filters, genreName),
      filteredMovies,
    };
  }

  const rawCandidates =
    profile.totalWatched === 0 && favoriteGenres.length === 0
      ? await retrieveColdStartCandidates([])
      : profile.totalWatched === 0
        ? await retrieveColdStartCandidates(favoriteGenres)
        : await retrieveCandidates(profile);

  const defaultCandidates = rawCandidates.filter((candidate) =>
    meetsDefaultRecommendationCriteria(candidate.movie)
  );
  const grouped = mergeCandidates(defaultCandidates);
  const scored = scoreCandidates(grouped, profile);
  const sections = buildSections(scored, profile);

  return {
    sections,
    tasteSummary,
    generatedAt: new Date().toISOString(),
    isFilteredMode: false,
  };
}
