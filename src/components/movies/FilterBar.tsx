"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { getYearFilterOptions } from "@/lib/year-filters";

export default function FilterBar({ genres, basePath = "/search" }: { genres: { id: number; name: string }[], basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);

  // Current states from URL
  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentLanguage = searchParams.get("language") || "";
  const currentSort = searchParams.get("sort") || (basePath === "/top-rated" ? "vote_average.desc" : "popularity.desc");
  const currentQuery = searchParams.get("query") || "";

  const applyFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 when filters change
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(currentQuery ? `${basePath}?query=${currentQuery}` : basePath);
    setIsOpen(false);
  };

  const hasFilters = currentGenre || currentYear || currentRating || currentLanguage || searchParams.has("sort");

  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          isOpen || hasFilters 
            ? "bg-[#8b3a2a] text-[#c8c4bc]" 
            : "bg-[#1a1a1a] text-[#c8c4bc]/70 hover:text-[#c8c4bc] border border-[#c8c4bc]/10"
        }`}
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
        {hasFilters && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">Active</span>}
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-2xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Sort Filter */}
            <div>
              <label className="block text-xs text-[#c8c4bc]/50 mb-1">Sort By</label>
              <select 
                value={currentSort}
                onChange={(e) => applyFilters("sort", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Newest Release</option>
                <option value="revenue.desc">Highest Grossing</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-xs text-[#c8c4bc]/50 mb-1">Language (Indian / Global)</label>
              <select 
                value={currentLanguage}
                onChange={(e) => applyFilters("language", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              >
                <option value="">Any Language</option>
                <optgroup label="Indian Cinema">
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="hi">Hindi</option>
                  <option value="ml">Malayalam</option>
                  <option value="kn">Kannada</option>
                  <option value="bn">Bengali</option>
                  <option value="mr">Marathi</option>
                </optgroup>
                <optgroup label="Asian Cinema">
                  <option value="zh">Chinese (Mandarin)</option>
                  <option value="ko">Korean</option>
                  <option value="ja">Japanese</option>
                </optgroup>
                <optgroup label="Global">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </optgroup>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-xs text-[#c8c4bc]/50 mb-1">Genre</label>
              <select 
                value={currentGenre}
                onChange={(e) => applyFilters("genre", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              >
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs text-[#c8c4bc]/50 mb-1">Year</label>
              <select 
                value={currentYear}
                onChange={(e) => applyFilters("year", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              >
                {getYearFilterOptions().map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs text-[#c8c4bc]/50 mb-1">Min Rating</label>
              <select 
                value={currentRating}
                onChange={(e) => applyFilters("rating", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c8c4bc]/10 rounded-lg px-3 py-2 text-sm text-[#c8c4bc] focus:outline-none focus:border-[#8b3a2a]"
              >
                <option value="">Any Rating</option>
                <option value="8">8+ (Excellent)</option>
                <option value="7">7+ (Good)</option>
                <option value="6">6+ (Okay)</option>
                <option value="5">5+ (Average)</option>
              </select>
            </div>

          </div>
          
          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-[#c8c4bc]/50 hover:text-[#8b3a2a] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
