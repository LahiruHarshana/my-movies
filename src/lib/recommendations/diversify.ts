import type { ScoredCandidate } from "./types";
import { genreJaccard } from "./scoring";
import { RECOMMENDATION_LIMITS } from "./constants";

const LAMBDA = 0.72;
const MAX_PER_GENRE = RECOMMENDATION_LIMITS.DIVERSIFY_MAX_PER_GENRE;
const MAX_PER_DECADE = RECOMMENDATION_LIMITS.DIVERSIFY_MAX_PER_DECADE;

function getDecade(releaseDate?: string): string {
  if (!releaseDate) return "unknown";
  const year = new Date(releaseDate).getFullYear();
  if (Number.isNaN(year)) return "unknown";
  return `${Math.floor(year / 10) * 10}s`;
}

export function diversifyResults(
  candidates: ScoredCandidate[],
  limit: number
): ScoredCandidate[] {
  const selected: ScoredCandidate[] = [];
  const genreCounts: Record<number, number> = {};
  const decadeCounts: Record<string, number> = {};
  const usedIds = new Set<number>();

  const pool = [...candidates];

  while (selected.length < limit && pool.length > 0) {
    let bestIndex = -1;
    let bestScore = -Infinity;

    pool.forEach((candidate, index) => {
      if (usedIds.has(candidate.movie.id)) return;

      let penalty = 0;
      candidate.movie.genre_ids?.forEach((genreId) => {
        if ((genreCounts[genreId] || 0) >= MAX_PER_GENRE) penalty += 0.35;
      });

      const decade = getDecade(candidate.movie.release_date);
      if ((decadeCounts[decade] || 0) >= MAX_PER_DECADE) penalty += 0.2;

      let maxSimilarity = 0;
      selected.forEach((picked) => {
        const similarity = genreJaccard(
          candidate.movie.genre_ids || [],
          picked.movie.genre_ids || []
        );
        maxSimilarity = Math.max(maxSimilarity, similarity);
      });

      const mmr = LAMBDA * candidate.score - (1 - LAMBDA) * maxSimilarity - penalty;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIndex = index;
      }
    });

    if (bestIndex === -1) break;

    const chosen = pool.splice(bestIndex, 1)[0];
    selected.push(chosen);
    usedIds.add(chosen.movie.id);

    chosen.movie.genre_ids?.forEach((genreId) => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
    const decade = getDecade(chosen.movie.release_date);
    decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
  }

  return selected;
}

export function pickByPredicate(
  candidates: ScoredCandidate[],
  predicate: (candidate: ScoredCandidate) => boolean,
  limit: number,
  usedIds: Set<number>
): ScoredCandidate[] {
  const picked: ScoredCandidate[] = [];

  for (const candidate of candidates) {
    if (picked.length >= limit) break;
    if (usedIds.has(candidate.movie.id)) continue;
    if (!predicate(candidate)) continue;
    picked.push(candidate);
    usedIds.add(candidate.movie.id);
  }

  return picked;
}
