import type { TasteProfile, WatchedInput } from "./types";

const IMPORTED_GENRE = "Imported";

function getDecade(releaseDate?: string | null): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  if (Number.isNaN(year)) return null;
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

export function buildTasteProfile(
  watched: WatchedInput[],
  favoriteGenres: number[] = [],
  dismissedIds: number[] = [],
  watchlistIds: number[] = []
): TasteProfile {
  const genreWeights: Record<number, number> = {};
  const genreNames: Record<number, string> = {};
  const decadeWeights: Record<string, number> = {};
  const directorWeights: Record<string, number> = {};

  const ratedValues = watched
    .map((m) => m.rating ?? m.voteAverage)
    .filter((v): v is number => v != null);

  const avgRating =
    ratedValues.length > 0
      ? ratedValues.reduce((sum, v) => sum + v, 0) / ratedValues.length
      : 7;

  watched.forEach((movie) => {
    let weight = 0.35;

    if (movie.isFavorite) {
      weight = 2.5;
    } else if (movie.rating != null) {
      const centered = movie.rating - avgRating;
      weight = centered >= 0 ? 1 + centered / 5 : Math.max(0.1, 0.5 + centered / 10);
    } else if (movie.voteAverage != null) {
      weight = 0.5;
    }

    movie.genres?.forEach((genre) => {
      if (!genre.id || genre.name === IMPORTED_GENRE) return;
      genreWeights[genre.id] = (genreWeights[genre.id] || 0) + weight;
      genreNames[genre.id] = genre.name;
    });

    const decade = getDecade(movie.releaseDate);
    if (decade) {
      decadeWeights[decade] = (decadeWeights[decade] || 0) + weight;
    }

    if (movie.director) {
      directorWeights[movie.director] =
        (directorWeights[movie.director] || 0) + weight;
    }
  });

  favoriteGenres.forEach((genreId) => {
    genreWeights[genreId] = (genreWeights[genreId] || 0) + 0.75;
  });

  const seedMovies = watched
    .map((movie) => {
      let score = 0;
      if (movie.isFavorite) score += 5;
      if (movie.rating != null) score += movie.rating;
      else if (movie.voteAverage != null) score += movie.voteAverage * 0.6;
      return { tmdbId: movie.tmdbId, title: movie.title, score };
    })
    .filter((seed) => seed.score >= 7)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topGenreEntries = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topGenreNames = topGenreEntries
    .map(([id]) => genreNames[Number(id)])
    .filter(Boolean);

  let confidence: TasteProfile["confidence"] = "low";
  if (watched.length >= 20 && ratedValues.length >= 8) confidence = "high";
  else if (watched.length >= 8 || ratedValues.length >= 4) confidence = "medium";

  return {
    genreWeights,
    genreNames,
    decadeWeights,
    directorWeights,
    favoriteGenres,
    seedMovies,
    watchedIds: new Set(watched.map((m) => m.tmdbId)),
    watchlistIds: new Set(watchlistIds),
    dismissedIds: new Set(dismissedIds),
    totalWatched: watched.length,
    avgRating,
    topGenreNames,
    confidence,
  };
}

export function getConfidenceMessage(confidence: TasteProfile["confidence"], totalWatched: number): string {
  if (confidence === "high") {
    return "Recommendations are highly personalized from your watch history.";
  }
  if (confidence === "medium") {
    return "Add more ratings to sharpen your recommendations.";
  }
  if (totalWatched === 0) {
    return "Rate a few watched films or set favorite genres to unlock deeper personalization.";
  }
  return "We're blending your history with acclaimed essentials until we learn more about your taste.";
}
