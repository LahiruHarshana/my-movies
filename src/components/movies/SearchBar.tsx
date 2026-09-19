"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("query", query);
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("query");
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <motion.form 
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSearch} 
      className="relative w-full max-w-xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b3a2a] to-#8b3a2a rounded-full blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
        <div className="relative bg-[#1a1a1a] rounded-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c8c4bc]/50 w-5 h-5 group-hover:text-[#8b3a2a] transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, actors, or genres..."
            className="w-full bg-transparent border border-[#c8c4bc]/10 rounded-full py-4 pl-14 pr-32 text-[#c8c4bc] focus:outline-none focus:border-transparent transition-all placeholder:text-[#c8c4bc]/40"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8b3a2a] hover:bg-[#8b3a2a] text-[#c8c4bc] px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-[#8b3a2a]/50"
          >
            Search
          </button>
        </div>
      </div>
    </motion.form>
  );
}
