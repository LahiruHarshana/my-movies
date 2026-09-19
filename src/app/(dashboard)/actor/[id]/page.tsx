import { getPersonDetails, getPersonMovieCredits, getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import MovieCard from "@/components/movies/MovieCard";

export default async function ActorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const personId = parseInt(params.id, 10);

  const [person, credits] = await Promise.all([
    getPersonDetails(personId),
    getPersonMovieCredits(personId)
  ]);

  // Filter out movies with no poster, and sort them. 
  // Let's sort by vote_average (for "best") but require at least 100 votes to weed out obscure entries.
  // Then we can also sort by popularity as a fallback.
  const allMovies = credits.cast
    .filter((m: any) => m.poster_path)
    .sort((a: any, b: any) => {
      // Prioritize highly rated movies with decent vote counts
      if (a.vote_count > 300 && b.vote_count > 300) {
        return b.vote_average - a.vote_average;
      }
      return b.popularity - a.popularity;
    });

  return (
    <div className="space-y-12 pb-12">
      <BackButton />

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        {/* Actor Image */}
        <div className="shrink-0 w-48 sm:w-64 relative poster-shell p-[1px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
          <div className="bg-[#1a1a1a] rounded-2xl relative aspect-[2/3] overflow-hidden">
            {person.profile_path ? (
              <Image 
                src={getImageUrl(person.profile_path, "h632")} 
                alt={person.name}
                fill
                className="object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#c8c4bc]/20">
                <UserIcon className="w-20 h-20" />
              </div>
            )}
            {/* Template border corners */}
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#8b3a2a] z-20"></div>
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#8b3a2a] z-20"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#8b3a2a] z-20"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#8b3a2a] z-20"></div>
          </div>
        </div>

        {/* Actor Info */}
        <div className="flex-1">
          <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
            [ PERSON // ACTOR_PROFILE ]
          </div>
          <h1 className="font-sans font-extralight text-4xl sm:text-6xl tracking-tighter uppercase text-[#c8c4bc] leading-tight mb-4">
            {person.name}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#c8c4bc]/70 uppercase tracking-widest mb-8">
            {person.birthday && (
              <div className="border border-[#c8c4bc]/10 bg-[#c8c4bc]/5 px-3 py-1.5 rounded-md">
                BORN: {person.birthday}
              </div>
            )}
            {person.place_of_birth && (
              <div className="border border-[#c8c4bc]/10 bg-[#c8c4bc]/5 px-3 py-1.5 rounded-md">
                {person.place_of_birth}
              </div>
            )}
            <div className="border border-[#c8c4bc]/10 bg-[#c8c4bc]/5 px-3 py-1.5 rounded-md text-[#8b3a2a]">
              {allMovies.length} CREDITS
            </div>
          </div>

          {person.biography && (
            <p className="font-sans font-light text-[#c8c4bc]/70 leading-relaxed max-w-4xl text-sm sm:text-base line-clamp-[8] hover:line-clamp-none transition-all">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      <div className="pt-12 border-t border-[#c8c4bc]/10">
        <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b3a2a] flicker-text"></span>
          [ FILMOGRAPHY // HIGHEST_RATED_FIRST ]
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {allMovies.map((movie: any, idx: number) => (
            <MovieCard key={`${movie.id}-${idx}`} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}
