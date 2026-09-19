import { Skeleton } from "@/components/ui/Skeleton";

export default function GridLoading() {
  return (
    <div>
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
