import { getGenreList, discoverMovies } from "@/lib/tmdb";
import FilterBar from "@/components/movies/FilterBar";
import MovieCard from "@/components/movies/MovieCard";
import { applyYearToDiscoverParams } from "@/lib/year-filters";

export default async function TopRatedPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  
  const [genresResponse] = await Promise.all([
    getGenreList()
  ]);

  const hasFilters = !!(searchParams.genre || searchParams.year || searchParams.rating || searchParams.language);
  
  // If the user applies filters, we want to show ALL matching movies. 
  // We use a tiny vote limit (10) just to prevent unrated student films from taking the #1 spot.
  // If no filters, we enforce a strict 1000 limit so it's a true "All-Time Top Rated" list.
  const voteLimit = hasFilters ? "10" : "1000";

  const params: Record<string, string> = {
    sort_by: searchParams.sort || "vote_average.desc",
    "vote_count.gte": voteLimit, 
  };

  if (searchParams.genre) {
    params.with_genres = searchParams.genre;
  }
  if (searchParams.language) {
    params.with_original_language = searchParams.language;
  }
  if (searchParams.year) {
    applyYearToDiscoverParams(params, searchParams.year);
  }
  if (searchParams.rating) {
    params["vote_average.gte"] = searchParams.rating;
  }
  
  const page = searchParams.page ? searchParams.page : "1";
  params.page = page;

  const results = await discoverMovies(params);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
          [ HALL_OF_FAME // TOP_RATED ]
        </div>
        <h1 className="font-sans font-extralight text-4xl sm:text-5xl tracking-tighter uppercase text-[#c8c4bc] leading-tight mb-2">
          Highest Rated Films
        </h1>
        <p className="font-mono text-xs text-[#c8c4bc]/50 uppercase tracking-widest max-w-2xl mb-8">
          The best movies in cinema history, filtered by your preferences.
        </p>

        <FilterBar genres={genresResponse.genres} basePath="/top-rated" />
      </div>

      {results.results.length === 0 ? (
        <div className="text-center text-[#c8c4bc]/50 py-20 font-mono text-xs uppercase tracking-widest border border-[#c8c4bc]/10 rounded-2xl bg-[#1a1a1a]">
          [ NO_MOVIES_FOUND_MATCHING_FILTERS ]
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.results.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Basic Pagination for Server-side */}
      {results.total_pages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          {parseInt(page) > 1 && (
            <a 
              href={`/top-rated?${new URLSearchParams({ ...searchParams, page: (parseInt(page) - 1).toString() }).toString()}`}
              className="px-6 py-2 border border-[#c8c4bc]/20 rounded-lg text-sm text-[#c8c4bc]/70 hover:text-[#8b3a2a] hover:border-[#8b3a2a] font-mono uppercase tracking-widest transition-colors"
            >
              Previous
            </a>
          )}
          {parseInt(page) < results.total_pages && (
            <a 
              href={`/top-rated?${new URLSearchParams({ ...searchParams, page: (parseInt(page) + 1).toString() }).toString()}`}
              className="px-6 py-2 border border-[#c8c4bc]/20 rounded-lg text-sm text-[#c8c4bc]/70 hover:text-[#8b3a2a] hover:border-[#8b3a2a] font-mono uppercase tracking-widest transition-colors"
            >
              Next Page
            </a>
          )}
        </div>
      )}
    </div>
  );
}
