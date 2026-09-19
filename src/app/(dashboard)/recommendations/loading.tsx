import { Skeleton } from "@/components/ui/Skeleton";

export default function RecommendationsLoading() {
  return (
    <div>
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="rounded-2xl border border-[#c8c4bc]/10 p-6 mb-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="mb-12">
          <Skeleton className="h-6 w-56 mb-6" />
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 6 }).map((__, cardIndex) => (
              <Skeleton key={cardIndex} className="aspect-[2/3] w-36 sm:w-48 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
