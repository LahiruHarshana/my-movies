import RecommendationCard from "./RecommendationCard";
import type { RecommendationSection as SectionType } from "@/lib/recommendations/types";

export default function RecommendationSection({ section }: { section: SectionType }) {
  if (section.movies.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[#c8c4bc]">
          <span className="w-1 h-6 bg-[#8b3a2a] rounded-full" />
          {section.title}
        </h2>
        {section.description && (
          <p className="text-sm text-[#c8c4bc]/50 mt-2 ml-3">{section.description}</p>
        )}
      </div>

      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {section.movies.map((movie) => (
            <RecommendationCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
