"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, CheckCircle, X, Undo2 } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { addToWatched } from "@/actions/watched";
import { addToWatchlist } from "@/actions/watchlist";
import { dismissRecommendation, undoDismissRecommendation } from "@/actions/recommendations";
import { toast } from "sonner";
import type { RecommendationMovie } from "@/lib/recommendations/types";
import { motion } from "framer-motion";

export default function RecommendationCard({
  movie,
  fullWidth = false,
}: {
  movie: RecommendationMovie;
  fullWidth?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  const handleDismiss = () => {
    startTransition(async () => {
      const result = await dismissRecommendation(movie.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setDismissed(true);
      toast.success("We'll show fewer titles like this");
    });
  };

  const handleUndoDismiss = () => {
    startTransition(async () => {
      const result = await undoDismissRecommendation(movie.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setDismissed(false);
      toast.success("Recommendation restored");
    });
  };

  const handleAddWatchlist = () => {
    startTransition(async () => {
      const result = await addToWatchlist({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        genres: movie.genre_ids.map((id) => ({ id, name: "" })),
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
      });
      if (result?.error) toast.error(result.error);
      else toast.success("Added to watchlist");
    });
  };

  const handleMarkWatched = () => {
    startTransition(async () => {
      const result = await addToWatched({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        genres: movie.genre_ids.map((id) => ({ id, name: "" })),
        releaseDate: movie.release_date,
        overview: movie.overview,
        voteAverage: movie.vote_average,
        watchedDate: new Date().toISOString(),
      });
      if (result?.error) toast.error(result.error);
      else toast.success("Marked as watched");
    });
  };

  if (dismissed) {
    return (
      <div className="snap-start shrink-0 w-36 sm:w-48 rounded-xl border border-[#c8c4bc]/10 bg-[#c8c4bc]/[0.02] p-4 flex flex-col items-center justify-center min-h-[280px]">
        <p className="text-xs text-[#c8c4bc]/50 text-center mb-3">Hidden from recommendations</p>
        <button
          onClick={handleUndoDismiss}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#8b3a2a] hover:text-[#c8c4bc] transition-colors disabled:opacity-50"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group ${fullWidth ? "w-full" : "snap-start shrink-0 w-36 sm:w-48"}`}
    >
      <Link href={`/movie/${movie.id}`}>
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          className="relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#c8c4bc]/10 hover:border-[#8b3a2a]/30 transition-colors shadow-lg shadow-black/40"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#8b3a2a] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 z-20" />

          <div className="relative aspect-[2/3] w-full bg-black/20">
            {movie.poster_path ? (
              <Image
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#c8c4bc]/30 text-xs font-mono uppercase tracking-widest p-4 text-center">
                No Image
              </div>
            )}

            {movie.vote_average > 0 && (
              <div className="absolute top-3 right-3 bg-[#1a1a1a]/90 backdrop-blur-md px-2 py-1 rounded border border-[#c8c4bc]/10">
                <span className="text-[10px] font-mono font-semibold text-[#8b3a2a] uppercase tracking-widest">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="p-3">
            <h3 className="font-sans font-light text-sm text-[#c8c4bc] line-clamp-2 group-hover:text-white transition-colors">
              {movie.title}
            </h3>
            {year && (
              <p className="text-[10px] font-mono text-[#c8c4bc]/50 uppercase tracking-widest mt-1">
                {year}
              </p>
            )}
          </div>
        </motion.div>
      </Link>

      {movie.reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.reasons.slice(0, 2).map((reason) => (
            <span
              key={reason}
              className="text-[9px] font-mono uppercase tracking-wider text-[#8b3a2a]/90 bg-[#8b3a2a]/10 border border-[#8b3a2a]/20 px-2 py-0.5 rounded-full"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={handleMarkWatched}
          disabled={isPending}
          title="Mark watched"
          className="p-1.5 rounded-lg border border-[#c8c4bc]/10 hover:border-[#8b3a2a]/40 hover:bg-[#8b3a2a]/10 text-[#c8c4bc]/60 hover:text-[#8b3a2a] transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleAddWatchlist}
          disabled={isPending}
          title="Add to watchlist"
          className="p-1.5 rounded-lg border border-[#c8c4bc]/10 hover:border-[#c8c4bc]/30 hover:bg-[#c8c4bc]/5 text-[#c8c4bc]/60 hover:text-[#c8c4bc] transition-colors disabled:opacity-50"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDismiss}
          disabled={isPending}
          title="Not interested"
          className="p-1.5 rounded-lg border border-[#c8c4bc]/10 hover:border-red-500/30 hover:bg-red-500/10 text-[#c8c4bc]/60 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
