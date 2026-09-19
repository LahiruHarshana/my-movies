"use client";
import { useState } from "react";
import { Bookmark, CheckCircle, FolderHeart, X, Check } from "lucide-react";
import { addToWatched, removeFromWatched } from "@/actions/watched";
import { addToWatchlist, removeFromWatchlist } from "@/actions/watchlist";
import { toast } from "sonner";
import AddToCollectionModal from "../collections/AddToCollectionModal";
import { motion } from "framer-motion";

export default function MovieActionButtons({ 
  movie, 
  director, 
  cast,
  collections = [],
  initialWatched = false,
  initialWatchlisted = false
}: { 
  movie: any, 
  director?: string, 
  cast?: string[],
  collections?: any[],
  initialWatched?: boolean,
  initialWatchlisted?: boolean
}) {
  const [loading, setLoading] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);

  const handleToggleWatchlist = async () => {
    setLoading(true);
    if (isWatchlisted) {
      const res = await removeFromWatchlist(movie.id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Removed from Watchlist");
        setIsWatchlisted(false);
      }
    } else {
      const res = await addToWatchlist({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        genres: movie.genres,
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Added to Watchlist!");
        setIsWatchlisted(true);
      }
    }
    setLoading(false);
  };

  const handleToggleWatched = async () => {
    setLoading(true);
    if (isWatched) {
      const res = await removeFromWatched(movie.id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Removed from Watched History");
        setIsWatched(false);
      }
    } else {
      const res = await addToWatched({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        genres: movie.genres,
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
        runtime: movie.runtime,
        watchedDate: new Date().toISOString(),
        director,
        cast,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Marked as Watched!");
        setIsWatched(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleWatched}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase transition-all disabled:opacity-50 shadow-lg ${
            isWatched
              ? "bg-[#8b3a2a]/20 border border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a]/30"
              : "bg-[#8b3a2a] text-[#c8c4bc] hover:bg-[#8b3a2a]/80 shadow-[#8b3a2a]/20"
          }`}
        >
          {isWatched ? (
            <>
              <Check className="w-4 h-4" />
              Watched
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Mark Watched
            </>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleWatchlist}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase transition-all disabled:opacity-50 ${
            isWatchlisted
              ? "bg-[#c8c4bc]/10 border border-[#c8c4bc] text-[#c8c4bc] hover:bg-[#c8c4bc]/20"
              : "bg-transparent border border-[#c8c4bc]/20 text-[#c8c4bc]/70 hover:border-[#c8c4bc]/50 hover:text-[#c8c4bc] backdrop-blur-md"
          }`}
        >
          {isWatchlisted ? (
            <>
              <Check className="w-4 h-4" />
              In Watchlist
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              Watchlist
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsColModalOpen(true)}
          className="flex-none flex items-center justify-center bg-transparent border border-[#c8c4bc]/20 hover:border-[#8b3a2a] hover:bg-[#8b3a2a]/10 text-[#c8c4bc]/70 hover:text-[#8b3a2a] backdrop-blur-md px-4 py-3.5 rounded-xl transition-all"
          title="Add to Collection"
        >
          <FolderHeart className="w-4 h-4" />
        </motion.button>
      </div>

      <AddToCollectionModal 
        movie={movie}
        collections={collections}
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
      />
    </div>
  );
}
