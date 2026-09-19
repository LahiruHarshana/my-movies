import { Suspense } from "react";
import { auth } from "@/auth";
import { getRecommendations, parseRecommendationFilters } from "@/lib/recommendations";
import { getGenreList } from "@/lib/tmdb";
import TasteSummaryCard from "@/components/recommendations/TasteSummaryCard";
import RecommendationSection from "@/components/recommendations/RecommendationSection";
import FilteredResultsGrid from "@/components/recommendations/FilteredResultsGrid";
import TmdbAttribution from "@/components/recommendations/TmdbAttribution";
import FilterBar from "@/components/movies/FilterBar";
import { Sparkles, Info } from "lucide-react";
import Link from "next/link";

export default async function RecommendationsPage(props: {
  searchParams: Promise<{
    genre?: string;
    year?: string;
    language?: string;
    rating?: string;
    sort?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const searchParams = await props.searchParams;
  const filters = parseRecommendationFilters(searchParams);

  const { genres } = await getGenreList();
  const genreName = filters.genre
    ? genres.find((g) => g.id.toString() === filters.genre)?.name
    : undefined;

  const result = await getRecommendations(session.user.id, filters, genreName);

  const hasContent =
    result.isFilteredMode
      ? (result.filteredMovies?.length ?? 0) > 0 || result.sections.length > 0
      : result.sections.length > 0;

  if (!hasContent) {
    return (
      <div>
        <PageHeader />
        <Suspense>
          <FilterBar genres={genres} basePath="/recommendations" />
        </Suspense>
        <div className="text-center mt-20 text-[#c8c4bc]/50 max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-[#c8c4bc]/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#c8c4bc] mb-2">
            {result.isFilteredMode ? "No Matches Found" : "Not Enough Data Yet"}
          </h2>
          <p className="mb-6">
            {result.isFilteredMode
              ? "No unseen movies match these filters. Try relaxing the year or minimum rating."
              : "We need to know a little more about your tastes to give you accurate recommendations."}
          </p>
          <Link
            href={result.isFilteredMode ? "/recommendations" : "/dashboard"}
            className="bg-[#8b3a2a] hover:bg-[#8b3a2a]/90 text-[#c8c4bc] px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            {result.isFilteredMode ? "Clear Filters" : "Discover Movies"}
          </Link>
        </div>
        <TmdbAttribution />
      </div>
    );
  }

  return (
    <div>
      <PageHeader />
      <Suspense>
        <FilterBar genres={genres} basePath="/recommendations" />
      </Suspense>

      <TasteSummaryCard summary={result.tasteSummary} />

      <div className="space-y-12">
        {result.sections.map((section) => (
          <RecommendationSection key={section.id} section={section} />
        ))}

        {result.isFilteredMode && (
          <FilteredResultsGrid
            movies={result.filteredMovies || []}
            filterChips={result.filterChips}
          />
        )}
      </div>

      <TmdbAttribution />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-[#8b3a2a] to-[#c8c4bc]">
        <Sparkles className="w-8 h-8 text-[#8b3a2a]" />
        For You
      </h1>
        <p className="text-[#c8c4bc]/50 mt-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Essential films you have not watched or saved — personalized from your taste
        </p>
    </div>
  );
}
