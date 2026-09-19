import type {
  RecommendationFilters,
  RecommendationMovie,
  RecommendationSection,
  ScoredCandidate,
  TasteProfile,
} from "./types";
import { diversifyResults, pickByPredicate } from "./diversify";
import { toRecommendationMovie } from "./scoring";
import { getFilterMatchReason } from "./filters";
import { RECOMMENDATION_LIMITS } from "./constants";
import { isIndianLanguage, isRegionalLanguage } from "./filters";
import { meetsDefaultRecommendationCriteria } from "./defaults";

function isEligible(candidate: ScoredCandidate, profile: TasteProfile): boolean {
  return (
    !profile.watchedIds.has(candidate.movie.id) &&
    !profile.watchlistIds.has(candidate.movie.id) &&
    !profile.dismissedIds.has(candidate.movie.id)
  );
}

function getSeedReservedIds(scored: ScoredCandidate[], profile: TasteProfile): Set<number> {
  const seedTitles = new Set(profile.seedMovies.map((seed) => seed.title));
  const reserved = new Set<number>();

  scored.forEach((candidate) => {
    if (candidate.seedTitles.some((title) => seedTitles.has(title))) {
      reserved.add(candidate.movie.id);
    }
  });

  return reserved;
}

export function buildSections(
  scored: ScoredCandidate[],
  profile: TasteProfile
): RecommendationSection[] {
  const eligible = scored.filter(
    (candidate) =>
      isEligible(candidate, profile) && meetsDefaultRecommendationCriteria(candidate.movie)
  );
  const sections: RecommendationSection[] = [];
  const usedIds = new Set<number>();
  const seedReservedIds = getSeedReservedIds(eligible, profile);

  const bestMatches = diversifyResults(
    eligible.filter(
      (candidate) =>
        !usedIds.has(candidate.movie.id) && !seedReservedIds.has(candidate.movie.id)
    ),
    RECOMMENDATION_LIMITS.SECTION_BEST_MATCHES
  );
  bestMatches.forEach((candidate) => usedIds.add(candidate.movie.id));

  if (bestMatches.length > 0) {
    sections.push({
      id: "best-matches",
      title: "Your Best Matches",
      description: "Indian and English films from 2010 onward, tuned to your taste.",
      movies: bestMatches.map(toRecommendationMovie),
    });
  }

  const mustWatch = pickByPredicate(
    eligible,
    (candidate) => {
      if (seedReservedIds.has(candidate.movie.id)) return false;
      if (candidate.breakdown.mustWatch < 0.55) return false;

      const votes = candidate.movie.vote_count || 0;
      const regional = isRegionalLanguage(candidate.movie.original_language);

      if (regional) {
        return votes >= 10 && (candidate.movie.vote_average || 0) >= 6.5;
      }

      return votes >= 1500;
    },
    RECOMMENDATION_LIMITS.SECTION_MUST_WATCH,
    usedIds
  );

  if (mustWatch.length > 0) {
    sections.push({
      id: "must-watch",
      title: "Must-Watch in Your Lifetime",
      description: "Essential films you have not watched or saved yet — the ones you need to see.",
      movies: mustWatch.map((candidate) =>
        toRecommendationMovie({
          ...candidate,
          reasons: [
            "Essential film with broad acclaim",
            ...candidate.reasons.slice(0, 1),
          ],
        })
      ),
    });
  }

  profile.seedMovies
    .slice(0, RECOMMENDATION_LIMITS.SEED_MOVIES_FOR_BECAUSE)
    .forEach((seed) => {
      const becauseLoved = pickByPredicate(
        eligible,
        (candidate) => candidate.seedTitles.includes(seed.title),
        RECOMMENDATION_LIMITS.SECTION_BECAUSE_LOVED,
        usedIds
      );

      if (becauseLoved.length > 0) {
        sections.push({
          id: `because-${seed.tmdbId}`,
          title: `Because You Loved ${seed.title}`,
          description: "Films with similar themes, tone, and audience appeal.",
          movies: becauseLoved.map(toRecommendationMovie),
        });
      }
    });

  const hiddenGems = pickByPredicate(
    eligible,
    (candidate) =>
      !seedReservedIds.has(candidate.movie.id) &&
      (candidate.sourceTags.includes("hidden_gem") ||
        ((candidate.movie.vote_count || 0) >= 50 &&
          (candidate.movie.vote_count || 0) <= 900 &&
          candidate.breakdown.quality >= 0.7)),
    RECOMMENDATION_LIMITS.SECTION_HIDDEN_GEMS,
    usedIds
  );

  if (hiddenGems.length > 0) {
    sections.push({
      id: "hidden-gems",
      title: "Hidden Gems",
      description: "Outstanding films that are acclaimed but easy to miss.",
      movies: hiddenGems.map(toRecommendationMovie),
    });
  }

  const explore = pickByPredicate(
    eligible,
    (candidate) =>
      !seedReservedIds.has(candidate.movie.id) &&
      (candidate.sourceTags.includes("explore") || candidate.breakdown.explore >= 0.9) &&
      (candidate.movie.original_language === "en" || isIndianLanguage(candidate.movie.original_language)),
    RECOMMENDATION_LIMITS.SECTION_EXPLORE,
    usedIds
  );

  if (explore.length > 0) {
    sections.push({
      id: "explore",
      title: "Explore Beyond Your Usual Taste",
      description: "Indian and English picks from 2010 onward outside your usual genres.",
      movies: explore.map(toRecommendationMovie),
    });
  }

  const morePicks = pickByPredicate(
    eligible,
    (candidate) => !seedReservedIds.has(candidate.movie.id),
    RECOMMENDATION_LIMITS.SECTION_MORE_PICKS,
    usedIds
  );

  if (morePicks.length > 0) {
    sections.push({
      id: "more-picks",
      title: "More Picks For You",
      description: "Additional highly ranked films you have not watched or queued yet.",
      movies: morePicks.map(toRecommendationMovie),
    });
  }

  return sections;
}

export function buildFilteredSection(
  scored: ScoredCandidate[],
  profile: TasteProfile,
  filters: RecommendationFilters,
  genreName?: string,
  limit = RECOMMENDATION_LIMITS.FILTERED_RESULTS
): RecommendationMovie[] {
  const filterReason = getFilterMatchReason(filters, genreName);

  return scored
    .filter(
      (candidate) =>
        !profile.watchedIds.has(candidate.movie.id) &&
        !profile.watchlistIds.has(candidate.movie.id) &&
        !profile.dismissedIds.has(candidate.movie.id)
    )
    .slice(0, limit)
    .map((candidate) =>
      toRecommendationMovie({
        ...candidate,
        reasons: [filterReason, ...candidate.reasons.filter((r) => r !== filterReason)].slice(0, 3),
      })
    );
}
