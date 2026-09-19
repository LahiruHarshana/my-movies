import type { RawCandidate, ScoredCandidate, TasteProfile } from "./types";
import { TMDBMovie } from "@/types/movie";
import { INDIAN_LANGUAGE_CODES, isRegionalLanguage, LANGUAGE_LABELS } from "./filters";
import { isDefaultPrimaryLanguage, isFilterOnlyLanguage } from "./defaults";

const GLOBAL_MEAN_RATING = 7;
const MIN_VOTES_FOR_CONFIDENCE = 250;
const RRK = 60;

function bayesianQuality(voteAverage: number, voteCount: number): number {
  const v = voteAverage || 0;
  const n = voteCount || 0;
  return (v * n + GLOBAL_MEAN_RATING * MIN_VOTES_FOR_CONFIDENCE) / (n + MIN_VOTES_FOR_CONFIDENCE);
}

function normalize01(value: number, min = 0, max = 1): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getDecade(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  if (Number.isNaN(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function computePersonalFit(movie: TMDBMovie, profile: TasteProfile): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let genreScore = 0;
  let genreHits = 0;

  const maxGenreWeight = Math.max(...Object.values(profile.genreWeights), 1);

  movie.genre_ids?.forEach((genreId) => {
    const weight = profile.genreWeights[genreId];
    if (weight > 0) {
      genreScore += weight / maxGenreWeight;
      genreHits += 1;
      const name = profile.genreNames[genreId];
      if (name && !reasons.some((r) => r.includes(name))) {
        reasons.push(`Matches your ${name} taste`);
      }
    }
  });

  const decade = getDecade(movie.release_date);
  let decadeScore = 0;
  if (decade && profile.decadeWeights[decade]) {
    const maxDecade = Math.max(...Object.values(profile.decadeWeights), 1);
    decadeScore = profile.decadeWeights[decade] / maxDecade;
    reasons.push(`Acclaimed ${decade} essential`);
  }

  const personalFit = genreHits > 0
    ? normalize01((genreScore / genreHits) * 0.75 + decadeScore * 0.25)
    : decadeScore * 0.5;

  return { score: personalFit, reasons };
}

function computeTmdbEvidence(
  grouped: { source: string; rank: number; seedTitle?: string }[]
): { score: number; reasons: string[]; seedTitles: string[] } {
  const reasons: string[] = [];
  const seedTitles = grouped
    .map((g) => g.seedTitle)
    .filter((title): title is string => Boolean(title));

  let evidence = 0;
  grouped.forEach((entry) => {
    evidence += 1 / (RRK + entry.rank);
  });

  const uniqueSeeds = [...new Set(seedTitles)];
  if (uniqueSeeds.length === 1) {
    reasons.push(`Because you loved ${uniqueSeeds[0]}`);
  } else if (uniqueSeeds.length > 1) {
    reasons.push(`Recommended from films you loved`);
  } else if (grouped.some((g) => g.source === "top_rated")) {
    reasons.push("All-time essential cinema");
  } else if (grouped.some((g) => g.source === "hidden_gem")) {
    reasons.push("Highly rated hidden gem");
  } else if (grouped.some((g) => g.source === "trending")) {
    reasons.push("Trending now");
  } else if (grouped.some((g) => g.source === "explore")) {
    reasons.push("Expands your usual genres");
  } else if (grouped.some((g) => g.source === "world_cinema")) {
    reasons.push("Acclaimed world cinema pick");
  } else if (grouped.some((g) => g.source === "filtered_discover")) {
    reasons.push("Matches your language filter");
  }

  const sourceCount = new Set(grouped.map((g) => g.source)).size;
  if (sourceCount > 1) {
    reasons.push(`Backed by ${sourceCount} recommendation signals`);
  }

  return {
    score: normalize01(evidence, 0, 0.08),
    reasons,
    seedTitles: uniqueSeeds,
  };
}

function computeMustWatch(movie: TMDBMovie): number {
  const regional = isRegionalLanguage(movie.original_language);
  const quality = bayesianQuality(movie.vote_average, movie.vote_count);
  const voteCap = regional ? 2500 : 15000;
  const voteSignal = normalize01(Math.log10((movie.vote_count || 0) + 1), 0, Math.log10(voteCap));
  const popularityCap = regional ? 80 : 200;
  const popularitySignal = normalize01(movie.popularity || 0, 0, popularityCap);
  return normalize01(quality / 10 * 0.55 + voteSignal * 0.35 + popularitySignal * 0.1);
}

function computePrimaryLanguageBoost(movie: TMDBMovie): number {
  if (isFilterOnlyLanguage(movie.original_language)) return -0.2;
  if (movie.original_language && INDIAN_LANGUAGE_CODES.has(movie.original_language)) return 0.1;
  if (movie.original_language === "en") return 0.05;
  if (movie.original_language && !isDefaultPrimaryLanguage(movie.original_language)) return -0.15;
  return 0;
}

function getPrimaryLanguageReason(movie: TMDBMovie): string | null {
  if (!movie.original_language || !INDIAN_LANGUAGE_CODES.has(movie.original_language)) return null;
  const label = LANGUAGE_LABELS[movie.original_language] || movie.original_language;
  return `Top ${label} cinema`;
}

function computeExploreBoost(movie: TMDBMovie, profile: TasteProfile): number {
  const overlap = movie.genre_ids?.some((id) => (profile.genreWeights[id] || 0) > 0);
  return overlap ? 0 : 1;
}

export function mergeCandidates(candidates: RawCandidate[]): Map<number, RawCandidate[]> {
  const grouped = new Map<number, RawCandidate[]>();

  candidates.forEach((candidate) => {
    const existing = grouped.get(candidate.movie.id) || [];
    existing.push(candidate);
    grouped.set(candidate.movie.id, existing);
  });

  return grouped;
}

export function scoreCandidates(
  grouped: Map<number, RawCandidate[]>,
  profile: TasteProfile
): ScoredCandidate[] {
  const scored: ScoredCandidate[] = [];

  grouped.forEach((entries, tmdbId) => {
    if (
      profile.watchedIds.has(tmdbId) ||
      profile.watchlistIds.has(tmdbId) ||
      profile.dismissedIds.has(tmdbId)
    ) {
      return;
    }

    const movie = entries[0].movie;
    const personal = computePersonalFit(movie, profile);
    const evidence = computeTmdbEvidence(entries);
    const quality = normalize01(bayesianQuality(movie.vote_average, movie.vote_count) / 10);
    const mustWatch = computeMustWatch(movie);
    const explore = computeExploreBoost(movie, profile);
    const primaryLanguageBoost = computePrimaryLanguageBoost(movie);
    const primaryLanguageReason = getPrimaryLanguageReason(movie);

    const confidenceMultiplier =
      profile.confidence === "high" ? 1 : profile.confidence === "medium" ? 0.85 : 0.65;

    const total =
      (personal.score * 0.4 +
        evidence.score * 0.3 +
        quality * 0.15 +
        mustWatch * 0.1 +
        explore * 0.05 +
        primaryLanguageBoost) *
      confidenceMultiplier;

    const reasons = [
      ...new Set([
        ...(primaryLanguageReason ? [primaryLanguageReason] : []),
        ...personal.reasons,
        ...evidence.reasons,
      ]),
    ].slice(0, 3);

    scored.push({
      movie,
      score: total,
      breakdown: {
        personalFit: personal.score,
        tmdbEvidence: evidence.score,
        quality,
        mustWatch,
        explore,
        total,
      },
      reasons,
      sourceTags: [...new Set(entries.map((e) => e.source))],
      seedTitles: evidence.seedTitles,
    });
  });

  return scored.sort((a, b) => b.score - a.score);
}

export function toRecommendationMovie(candidate: ScoredCandidate) {
  const { movie } = candidate;
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids,
    overview: movie.overview,
    popularity: movie.popularity,
    reasons: candidate.reasons,
    score: candidate.score,
  };
}

export function genreJaccard(a: number[], b: number[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((id) => setB.has(id)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}
