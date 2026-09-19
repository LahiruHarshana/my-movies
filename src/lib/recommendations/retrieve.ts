import { discoverMovies, getMovieRecommendations } from "@/lib/tmdb";
import type { RawCandidate, RecommendationFilters, TasteProfile } from "./types";
import {
  buildDiscoverParams,
  getFilteredDiscoverSorts,
  getFilteredPageCount,
  isIndianLanguage,
  isRegionalLanguage,
  movieMatchesFilters,
} from "./filters";
import { DEFAULT_PRIMARY_LANGUAGES, RETRIEVAL_LIMITS } from "./constants";
import { DEFAULT_RELEASE_DATE_GTE } from "./defaults";

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function toRawCandidates(
  movies: { id: number }[],
  source: RawCandidate["source"],
  seedTitle?: string
): RawCandidate[] {
  return movies.map((movie, index) => ({
    movie: movie as RawCandidate["movie"],
    source,
    rank: index + 1,
    seedTitle,
  }));
}

function topGenreIds(profile: TasteProfile, count = 3): number[] {
  return Object.entries(profile.genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id]) => Number(id));
}

export async function retrieveCandidates(profile: TasteProfile): Promise<RawCandidate[]> {
  const tasks: Promise<RawCandidate[]>[] = [];
  const genres = topGenreIds(profile);
  const genreParam = genres.join("|");

  profile.seedMovies.forEach((seed) => {
    for (let page = 1; page <= RETRIEVAL_LIMITS.ITEM_REC_PAGES; page++) {
      tasks.push(
        safeFetch(async () => {
          const response = await getMovieRecommendations(seed.tmdbId, page);
          return toRawCandidates(
            response.results.slice(0, RETRIEVAL_LIMITS.ITEM_REC_PER_PAGE),
            "item_recommendation",
            seed.title
          );
        }, [])
      );
    }
  });

  if (genres.length > 0) {
    for (let page = 1; page <= RETRIEVAL_LIMITS.GENRE_DISCOVER_PAGES; page++) {
      tasks.push(
        safeFetch(async () => {
        const response = await discoverMovies({
          with_genres: genreParam,
          sort_by: "vote_average.desc",
          "vote_count.gte": "500",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          include_adult: "false",
          page: page.toString(),
        });
          return toRawCandidates(
            response.results.slice(0, RETRIEVAL_LIMITS.GENRE_DISCOVER_PER_PAGE),
            "genre_discover"
          );
        }, [])
      );

      tasks.push(
        safeFetch(async () => {
        const response = await discoverMovies({
          with_genres: genreParam,
          sort_by: "popularity.desc",
          "vote_average.gte": "7.5",
          "vote_count.gte": "50",
          "vote_count.lte": "800",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          include_adult: "false",
          page: page.toString(),
        });
          return toRawCandidates(
            response.results.slice(0, RETRIEVAL_LIMITS.HIDDEN_GEM_PER_PAGE),
            "hidden_gem"
          );
        }, [])
      );
    }
  }

  for (let page = 1; page <= RETRIEVAL_LIMITS.TOP_RATED_PAGES; page++) {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          sort_by: "vote_average.desc",
          "vote_count.gte": "200",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          with_original_language: "en",
          include_adult: "false",
          page: page.toString(),
        });
        return toRawCandidates(response.results, "top_rated");
      }, [])
    );
  }

  tasks.push(
    safeFetch(async () => {
      const response = await discoverMovies({
        sort_by: "popularity.desc",
        "vote_count.gte": "50",
        "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
        with_original_language: "en",
        include_adult: "false",
        page: "1",
      });
      return toRawCandidates(
        response.results.slice(0, RETRIEVAL_LIMITS.TRENDING_PER_PAGE),
        "trending"
      );
    }, [])
  );

  ["2010", "2020"].forEach((decadeStart) => {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          "primary_release_date.gte": `${decadeStart}-01-01`,
          "primary_release_date.lte": `${parseInt(decadeStart, 10) + 9}-12-31`,
          sort_by: "vote_average.desc",
          "vote_count.gte": "100",
          include_adult: "false",
          ...(genres.length > 0 ? { with_genres: genreParam } : {}),
        });
        return toRawCandidates(
          response.results.slice(0, RETRIEVAL_LIMITS.DECADE_ESSENTIAL_PER_PAGE),
          "decade_essential"
        );
      }, [])
    );
  });

  if (genres.length > 0) {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          without_genres: genres.join(","),
          sort_by: "vote_average.desc",
          "vote_count.gte": "100",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          with_original_language: "en",
          include_adult: "false",
        });
        return toRawCandidates(
          response.results.slice(0, RETRIEVAL_LIMITS.EXPLORE_PER_PAGE),
          "explore"
        );
      }, [])
    );
  } else {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          sort_by: "vote_average.desc",
          "vote_count.gte": "200",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          with_original_language: "en",
          include_adult: "false",
        });
        return toRawCandidates(
          response.results.slice(0, RETRIEVAL_LIMITS.EXPLORE_PER_PAGE),
          "explore"
        );
      }, [])
    );
  }

  tasks.push(...buildPrimaryCatalogTasks());

  const results = await Promise.all(tasks);
  return results.flat();
}

function buildPrimaryCatalogTasks(): Promise<RawCandidate[]>[] {
  const tasks: Promise<RawCandidate[]>[] = [];

  DEFAULT_PRIMARY_LANGUAGES.forEach((language) => {
    ["popularity.desc", "vote_average.desc"].forEach((sort) => {
      for (let page = 1; page <= 2; page++) {
        tasks.push(
          safeFetch(async () => {
            const response = await discoverMovies({
              with_original_language: language,
              sort_by: sort,
              "vote_count.gte": "5",
              "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
              include_adult: "false",
              page: page.toString(),
              ...(isIndianLanguage(language) ? { with_origin_country: "IN" } : {}),
            });
            return toRawCandidates(response.results, "genre_discover");
          }, [])
        );
      }
    });
  });

  return tasks;
}

export async function retrieveColdStartCandidates(favoriteGenres: number[]): Promise<RawCandidate[]> {
  const tasks: Promise<RawCandidate[]>[] = [];

  ["2010", "2020"].forEach((decadeStart) => {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          "primary_release_date.gte": `${decadeStart}-01-01`,
          "primary_release_date.lte": `${parseInt(decadeStart, 10) + 9}-12-31`,
          sort_by: "vote_average.desc",
          "vote_count.gte": "50",
          include_adult: "false",
        });
        return toRawCandidates(
          response.results.slice(0, RETRIEVAL_LIMITS.COLD_START_DECADE_COUNT),
          "decade_essential"
        );
      }, [])
    );
  });

  if (favoriteGenres.length > 0) {
    for (let page = 1; page <= 2; page++) {
      tasks.push(
        safeFetch(async () => {
          const response = await discoverMovies({
            with_genres: favoriteGenres.join("|"),
            sort_by: "vote_average.desc",
            "vote_count.gte": "50",
            "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
            include_adult: "false",
            page: page.toString(),
          });
          return toRawCandidates(
            response.results.slice(0, RETRIEVAL_LIMITS.COLD_START_GENRE_DISCOVER),
            "genre_discover"
          );
        }, [])
      );
    }
  }

  for (let page = 1; page <= 3; page++) {
    tasks.push(
      safeFetch(async () => {
        const response = await discoverMovies({
          sort_by: "vote_average.desc",
          "vote_count.gte": "100",
          "primary_release_date.gte": DEFAULT_RELEASE_DATE_GTE,
          with_original_language: "en",
          include_adult: "false",
          page: page.toString(),
        });
        return toRawCandidates(
          response.results.slice(0, RETRIEVAL_LIMITS.COLD_START_TOP_RATED),
          "top_rated"
        );
      }, [])
    );
  }

  tasks.push(...buildPrimaryCatalogTasks());

  const results = await Promise.all(tasks);
  return results.flat();
}

export async function retrieveFilteredCandidates(
  filters: RecommendationFilters,
  pages = 5
): Promise<RawCandidate[]> {
  const sorts = getFilteredDiscoverSorts(filters);
  const totalPages = getFilteredPageCount(filters, pages);
  const pagesPerSort = Math.max(2, Math.ceil(totalPages / sorts.length));
  const tasks: Promise<RawCandidate[]>[] = [];

  sorts.forEach((sort) => {
    for (let page = 1; page <= pagesPerSort; page++) {
      tasks.push(
        safeFetch(async () => {
          const response = await discoverMovies(buildDiscoverParams(filters, page, sort));
          const matched = response.results.filter((movie) => movieMatchesFilters(movie, filters));
          return toRawCandidates(matched, "filtered_discover");
        }, [])
      );
    }
  });

  if (isRegionalLanguage(filters.language)) {
    for (let page = 1; page <= 3; page++) {
      tasks.push(
        safeFetch(async () => {
          const response = await discoverMovies({
            ...buildDiscoverParams({ ...filters, rating: undefined }, page, "popularity.desc"),
            "vote_average.gte": "6.5",
          });
          const matched = response.results.filter((movie) => movieMatchesFilters(movie, filters));
          return toRawCandidates(matched, "filtered_discover");
        }, [])
      );
    }
  }

  const results = await Promise.all(tasks);
  return results.flat();
}
