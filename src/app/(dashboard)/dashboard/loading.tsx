import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-12">
      <div className="flex justify-center mb-8">
        <Skeleton className="h-10 w-2/3 max-w-md rounded-full" />
      </div>
      <div className="flex justify-center mb-12">
        <Skeleton className="h-12 w-full max-w-xl rounded-full" />
      </div>
      
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
