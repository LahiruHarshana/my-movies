"use client";
import { useState } from "react";
import MovieCard from "./MovieCard";
import { Loader2 } from "lucide-react";

interface PaginatedSectionProps {
  title?: string;
  initialMovies: any[];
  endpoint: string;
}

export default function PaginatedSection({ title, initialMovies, endpoint }: PaginatedSectionProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const separator = endpoint.includes("?") ? "&" : "?";
      const res = await fetch(`${endpoint}${separator}page=${nextPage}`);
      
      if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        setMovies(prev => [...prev, ...data.results]);
        setPage(nextPage);
        if (data.page >= data.total_pages || nextPage >= 10) { 
          // Cap at 10 pages to avoid hitting massive limits for UI
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more movies", error);
    }
    setLoading(false);
  };

  return (
    <section className="mb-12">
      {title && (
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#8b3a2a] rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie, idx) => (
          <MovieCard key={`${movie.id}-${idx}`} movie={movie} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-transparent hover:bg-[#8b3a2a]/10 text-[#c8c4bc]/70 hover:text-[#8b3a2a] border border-[#c8c4bc]/20 hover:border-[#8b3a2a] rounded-xl font-mono text-xs uppercase tracking-widest transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Loading..." : "Load More Sequences"}
          </button>
        </div>
      )}
    </section>
  );
}
