import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { getTrendingMovies, getTopRatedMovies } from "@/lib/tmdb";
import PaginatedSection from "@/components/movies/PaginatedSection";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function Dashboard() {
  const session = await auth();
  
  const [trending, topRated] = await Promise.all([
    getTrendingMovies(),
    getTopRatedMovies()
  ]);

  return (
    <div className="space-y-24 pb-12">
      {/* HERO SECTION - Templated Style */}
      <section className="relative mt-8">
        <div className="poster-shell p-[1px] rounded-2xl shadow-2xl shadow-black/80">
          <div className="bg-[#1a1a1a]/95 backdrop-blur-sm rounded-2xl relative overflow-hidden min-h-[400px] flex items-center justify-center">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, #c8c4bc 1px, transparent 1px)", backgroundSize: "48px 100%" }}></div>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8c4bc]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#8b3a2a] z-20"></div>
            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#8b3a2a] z-20"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#8b3a2a] z-20"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#8b3a2a] z-20"></div>

            <div className="relative z-10 text-center flex flex-col items-center max-w-3xl px-4 py-16">
              <div className="flex items-center gap-2 font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b3a2a] flicker-text"></span>
                [ MY_MOVIES // SYSTEM.ACTIVE ]
              </div>
              <h1 className="font-sans font-extralight text-4xl sm:text-5xl lg:text-7xl tracking-tighter uppercase text-[#c8c4bc] leading-[0.9]">
                Welcome Back, <br/>
                <span className="font-medium">{session?.user?.name || "User"}</span>
              </h1>
              <p className="mt-7 font-mono text-xs text-[#c8c4bc]/50 tracking-wider uppercase max-w-md mx-auto leading-relaxed">
                Your personal cinematic universe is ready. Track, rate, and discover new movies with precision.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link href="/recommendations" className="font-mono text-xs uppercase tracking-widest bg-[#8b3a2a] text-[#c8c4bc] px-7 py-3.5 rounded-lg hover:bg-[#8b3a2a]/80 transition-colors flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  For You
                </Link>
                <Link href="/search" className="font-mono text-xs uppercase tracking-widest border border-[#c8c4bc]/20 text-[#c8c4bc]/70 px-7 py-3.5 rounded-lg hover:border-[#8b3a2a] transition-colors">
                  Explore Network
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section>
        <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
          [ 01 // TRENDING_THIS_WEEK ]
        </div>
        <h2 className="font-sans font-extralight text-3xl sm:text-4xl tracking-tighter uppercase text-[#c8c4bc] max-w-2xl leading-tight mb-8">
          Global Trending
        </h2>
        <PaginatedSection 
          initialMovies={trending.results} 
          endpoint="/api/movies/trending" 
        />
      </section>

      {/* TOP RATED SECTION */}
      <section>
        <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
          [ 02 // TOP_RATED ]
        </div>
        <h2 className="font-sans font-extralight text-3xl sm:text-4xl tracking-tighter uppercase text-[#c8c4bc] max-w-2xl leading-tight mb-8">
          Critically Acclaimed
        </h2>
        <PaginatedSection 
          initialMovies={topRated.results} 
          endpoint="/api/movies/top-rated" 
        />
      </section>
    </div>
  );
}
