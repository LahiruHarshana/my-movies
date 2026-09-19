import { Skeleton } from "@/components/ui/Skeleton";

export default function MovieDetailsLoading() {
  return (
    <div>
      <Skeleton className="w-full h-[40vh] md:h-[60vh] rounded-2xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
