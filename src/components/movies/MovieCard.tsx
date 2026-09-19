"use client";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MovieCard({ movie }: { movie: any }) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  return (
    <Link href={`/movie/${movie.id}`}>
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#c8c4bc]/10 hover:bg-[#c8c4bc]/[0.02] transition-colors duration-500 shadow-lg shadow-black/40"
      >
        {/* Signature Expanding Top Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#8b3a2a] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 z-20"></div>

        <div className="relative aspect-[2/3] w-full bg-black/20">
          {movie.poster_path ? (
            <Image 
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 group-hover:grayscale"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#c8c4bc]/30 text-sm font-mono uppercase tracking-widest p-4 text-center">
              [ NO IMAGE ]
            </div>
          )}
          
          {/* Glassmorphism Rating Badge with Mono Font */}
          {movie.vote_average > 0 && (
            <div className="absolute top-3 right-3 bg-[#1a1a1a]/90 backdrop-blur-md px-2 py-1 rounded border border-[#c8c4bc]/10 flex items-center gap-1">
              <span className="text-[10px] font-mono font-semibold text-[#8b3a2a] uppercase tracking-widest">{movie.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Hover Overlay with Play Button */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-center absolute inset-0">
              <PlayCircle className="w-12 h-12 text-[#c8c4bc]/80 drop-shadow-[0_0_15px_rgba(200,196,188,0.3)] transform scale-75 group-hover:scale-100 transition-transform duration-300" />
            </div>
          </div>
        </div>

        <div className="p-4 relative z-10 bg-gradient-to-t from-[#1a1a1a] to-transparent">
          <h3 className="font-sans font-light text-sm md:text-base tracking-tight uppercase text-[#c8c4bc] line-clamp-1 group-hover:text-white transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#c8c4bc]/50 uppercase tracking-widest">
            {year ? `[ ${year} ]` : "[ UNKNOWN ]"}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
