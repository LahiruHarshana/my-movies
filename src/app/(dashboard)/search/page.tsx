import { searchMovies, discoverMovies, getGenreList } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import SearchBar from "@/components/movies/SearchBar";
import FilterBar from "@/components/movies/FilterBar";
import { applyYearToDiscoverParams } from "@/lib/year-filters";

export default async function SearchPage(props: { searchParams: Promise<{ query?: string; genre?: string; year?: string; rating?: string; sort?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.query || "";
  const genre = searchParams.genre || "";
  const year = searchParams.year || "";
  const rating = searchParams.rating || "";
  const sort = searchParams.sort || "popularity.desc";
  const language = searchParams.language || "";
  const page = searchParams.page || "1";

  const hasFilters = query || genre || year || rating || searchParams.sort || language;
  let results = null;

  // TMDB handles text search and filter discovery differently
  if (query && !genre && !year && !rating) {
    // Pure text search
    results = await searchMovies(query);
  } else if (hasFilters) {
    // Advanced discovery
    const discoverParams: Record<string, string> = {
      sort_by: sort,
      page: page,
      "vote_count.gte": sort.startsWith("vote_average") ? "10" : "0"
    };
    if (query) discoverParams.with_keywords = query; // Note: TMDB discover uses keywords, not full text, but we approximate it
    if (genre) discoverParams.with_genres = genre;
    if (year) applyYearToDiscoverParams(discoverParams, year);
    if (language) discoverParams.with_original_language = language;
    if (rating) discoverParams["vote_average.gte"] = rating;
    
    // If it's a pure text query WITH filters, we just run discover. 
    // It's a limitation of TMDB's free API that text search doesn't accept filters directly.
    results = await discoverMovies(discoverParams);
  }

  const { genres } = await getGenreList();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#8b3a2a] to-[#8b3a2a]">
        Search & Discover
      </h1>
      
      <div className="max-w-3xl mb-4">
        <SearchBar initialQuery={query} />
      </div>
      
      <div className="max-w-3xl">
        <FilterBar genres={genres} />
      </div>

      {!hasFilters && (
        <div className="text-center text-[#c8c4bc]/50 mt-20">
          <p className="text-lg">Start typing to search, or use Advanced Filters to discover movies.</p>
        </div>
      )}

      {results && results.results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
          {results.results.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      
      {results && results.total_pages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          {parseInt(page) > 1 && (
            <a 
              href={`/search?${new URLSearchParams({ ...searchParams, page: (parseInt(page) - 1).toString() }).toString()}`}
              className="px-6 py-2 border border-[#c8c4bc]/20 rounded-lg text-sm text-[#c8c4bc]/70 hover:text-[#8b3a2a] hover:border-[#8b3a2a] font-mono uppercase tracking-widest transition-colors"
            >
              Previous
            </a>
          )}
          {parseInt(page) < results.total_pages && (
            <a 
              href={`/search?${new URLSearchParams({ ...searchParams, page: (parseInt(page) + 1).toString() }).toString()}`}
              className="px-6 py-2 border border-[#c8c4bc]/20 rounded-lg text-sm text-[#c8c4bc]/70 hover:text-[#8b3a2a] hover:border-[#8b3a2a] font-mono uppercase tracking-widest transition-colors"
            >
              Next Page
            </a>
          )}
        </div>
      )}

      {results && results.results.length === 0 && (
        <div className="text-center text-[#c8c4bc]/50 mt-12">
          No movies found matching your criteria. Try adjusting your filters!
        </div>
      )}
    </div>
  );
}
