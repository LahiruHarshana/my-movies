"use client";
import { useState, useMemo } from "react";
import MovieCard from "./MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowDownWideNarrow, Filter, X } from "lucide-react";

export default function WatchlistClient({ movies }: { movies: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Filters State
  const [filterActor, setFilterActor] = useState("All");
  const [filterDirector, setFilterDirector] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  // Extract unique filter options from the provided movies
  const { categories, actors, directors, years } = useMemo(() => {
    const genreSet = new Set<string>();
    const actorSet = new Set<string>();
    const directorSet = new Set<string>();
    const yearSet = new Set<string>();

    movies.forEach(movie => {
      // Genres
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((g: any) => {
          if (g.name && g.name !== "Imported") genreSet.add(g.name);
        });
      }
      // Actors
      if (movie.cast && Array.isArray(movie.cast)) {
        movie.cast.forEach((c: string) => actorSet.add(c));
      }
      // Directors
      if (movie.director) {
        directorSet.add(movie.director);
      }
      // Years
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate).getFullYear().toString();
        if (year !== "NaN") yearSet.add(year);
      }
    });

    return {
      categories: ["All", ...Array.from(genreSet).sort()],
      actors: ["All", ...Array.from(actorSet).sort()],
      directors: ["All", ...Array.from(directorSet).sort()],
      years: ["All", ...Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a))] // Newest to oldest
    };
  }, [movies]);

  // Filter and Sort movies
  const processedMovies = useMemo(() => {
    let result = movies;

    // 1. Core Filters (Search & Genre)
    if (activeCategory !== "All") {
      result = result.filter(movie => 
        movie.genres?.some((g: any) => g.name === activeCategory)
      );
    }
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(movie => movie.title.toLowerCase().includes(lowerQ));
    }

    // 2. Advanced Filters
    if (filterActor !== "All") {
      result = result.filter(m => m.cast?.includes(filterActor));
    }
    if (filterDirector !== "All") {
      result = result.filter(m => m.director === filterDirector);
    }
    if (filterYear !== "All") {
      result = result.filter(m => {
        if (!m.releaseDate) return false;
        return new Date(m.releaseDate).getFullYear().toString() === filterYear;
      });
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "dateDesc") {
        const dateA = new Date(a.watchedDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.watchedDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "ratingDesc") {
        const ratingA = a.rating || a.voteAverage || 0;
        const ratingB = b.rating || b.voteAverage || 0;
        return ratingB - ratingA;
      }
      if (sortBy === "releaseDesc") {
        const dateA = new Date(a.releaseDate || 0).getTime();
        const dateB = new Date(b.releaseDate || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [movies, activeCategory, searchQuery, sortBy, filterActor, filterDirector, filterYear]);

  const hasAdvancedFiltersActive = filterActor !== "All" || filterDirector !== "All" || filterYear !== "All";

  return (
    <div>
      {/* Top Search & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8c4bc]/50 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search your list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a] transition-colors"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
              showAdvanced || hasAdvancedFiltersActive
                ? "bg-[#8b3a2a] text-[#c8c4bc] border-[#8b3a2a]" 
                : "bg-[#1a1a1a] text-[#c8c4bc]/70 hover:text-[#c8c4bc] border-[#c8c4bc]/10"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span> Filters
            {hasAdvancedFiltersActive && <span className="w-2 h-2 rounded-full bg-#8b3a2a animate-pulse ml-1"></span>}
          </button>

          <div className="relative w-40 sm:w-48">
            <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8c4bc]/50 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a] transition-colors appearance-none cursor-pointer"
            >
              <option value="dateDesc">Recently Added</option>
              <option value="ratingDesc">Highest Rated</option>
              <option value="releaseDesc">Newest Release</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-5 bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-[#c8c4bc]/50 mb-1.5">Director</label>
                <select
                  value={filterDirector}
                  onChange={(e) => setFilterDirector(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a] appearance-none"
                >
                  {directors.map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8c4bc]/50 mb-1.5">Actor</label>
                <select
                  value={filterActor}
                  onChange={(e) => setFilterActor(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a] appearance-none"
                >
                  {actors.map(actor => (
                    <option key={actor} value={actor}>{actor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8c4bc]/50 mb-1.5">Release Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-xl px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a] appearance-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Filter Pills (Genres) */}
      {categories.length > 1 && (
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categories.map(category => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-[#8b3a2a] text-[#c8c4bc] shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                    : "bg-[#1a1a1a] text-[#c8c4bc]/70 hover:bg-[#c8c4bc]/10 border border-[#c8c4bc]/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* Movies Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {processedMovies.map(movie => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={movie._id.toString()}
            >
              <MovieCard 
                movie={{
                  id: movie.tmdbId,
                  title: movie.title,
                  poster_path: movie.posterPath,
                  release_date: movie.releaseDate,
                  vote_average: movie.voteAverage
                }} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {processedMovies.length === 0 && (
        <div className="text-center text-[#c8c4bc]/50 mt-20">
          No movies found matching your filters.
        </div>
      )}
    </div>
  );
}
