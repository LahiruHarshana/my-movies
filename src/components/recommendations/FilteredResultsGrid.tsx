import RecommendationCard from "./RecommendationCard";
import type { RecommendationMovie } from "@/lib/recommendations/types";

export default function FilteredResultsGrid({
  movies,
  filterChips = [],
}: {
  movies: RecommendationMovie[];
  filterChips?: string[];
}) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-[#c8c4bc]/10 bg-[#c8c4bc]/[0.02]">
        <p className="text-lg text-[#c8c4bc]/70 mb-2">No unseen movies match these filters</p>
        <p className="text-sm text-[#c8c4bc]/40">
          Try relaxing the year or minimum rating to discover more titles.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[#c8c4bc]">
          <span className="w-1 h-6 bg-[#8b3a2a] rounded-full" />
          Best Matches For Your Filters
        </h2>
        <p className="text-sm text-[#c8c4bc]/50 mt-2 ml-3">
          Films not in your watched or watchlist history, ranked by your taste and filters.
        </p>
        {filterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 ml-3">
            {filterChips.map((chip) => (
              <span
                key={chip}
                className="text-[10px] font-mono uppercase tracking-wider text-[#8b3a2a] bg-[#8b3a2a]/10 border border-[#8b3a2a]/20 px-3 py-1 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <RecommendationCard key={movie.id} movie={movie} fullWidth />
        ))}
      </div>
    </section>
  );
}
