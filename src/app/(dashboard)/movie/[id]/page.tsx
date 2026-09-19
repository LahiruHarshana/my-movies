import { getMovieDetails, getImageUrl, getMovieCredits, getMovieRecommendations } from "@/lib/tmdb";
import { getUserCollections } from "@/actions/collections";
import { connectDB } from "@/lib/mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import WatchlistMovie from "@/models/WatchlistMovie";
import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar } from "lucide-react";
import MovieCard from "@/components/movies/MovieCard";
import MovieActionButtons from "@/components/movies/MovieActionButtons";

export default async function MovieDetailsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const params = await props.params;
  const movieId = parseInt(params.id, 10);
  
  await connectDB();

  const [movie, credits, recommendations, collections, watchedDoc, watchlistDoc] = await Promise.all([
    getMovieDetails(movieId),
    getMovieCredits(movieId),
    getMovieRecommendations(movieId),
    getUserCollections(),
    userId ? WatchedMovie.findOne({ userId, tmdbId: movieId }).lean() : null,
    userId ? WatchlistMovie.findOne({ userId, tmdbId: movieId }).lean() : null
  ]);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const director = credits.crew.find((c: any) => c.job === "Director")?.name;
  const topCast = credits.cast.slice(0, 3).map((c: any) => c.name);

  const isWatched = !!watchedDoc;
  const isWatchlisted = !!watchlistDoc;

  return (
    <div>
      <div className="relative h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-8">
        <Image 
          src={getImageUrl(movie.backdrop_path, "original") || getImageUrl(movie.poster_path, "w500")} 
          alt={movie.title}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-[#c8c4bc] mb-4">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-[#c8c4bc]/70 mb-6">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1 text-[#8b3a2a]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime} min</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="font-mono text-xs text-[#c8c4bc] border border-[#8b3a2a]/40 bg-[#8b3a2a]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="font-sans font-light text-[#c8c4bc]/80 leading-relaxed max-w-3xl mb-8 text-lg">
              {movie.overview}
            </p>

            <div className="max-w-md">
              <MovieActionButtons 
                movie={movie} 
                director={director} 
                cast={topCast} 
                collections={collections} 
                initialWatched={isWatched}
                initialWatchlisted={isWatchlisted}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
            [ 01 // CAST_AND_CREW ]
          </div>
          <h2 className="font-sans font-extralight text-2xl tracking-tighter uppercase text-[#c8c4bc] mb-6">
            Top Cast
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {credits.cast.slice(0, 9).map((person: any) => (
              <Link href={`/actor/${person.id}`} key={person.id} className="flex items-center gap-3 bg-[#c8c4bc]/[0.02] border border-[#c8c4bc]/10 p-3 rounded-xl hover:border-[#8b3a2a]/50 hover:bg-[#c8c4bc]/[0.04] transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-black/20 relative shrink-0">
                  {person.profile_path ? (
                    <Image src={getImageUrl(person.profile_path, "w500")} alt={person.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#c8c4bc]/30 text-xs font-mono">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#c8c4bc]">{person.name}</p>
                  <p className="text-xs font-mono text-[#c8c4bc]/50 group-hover:text-[#8b3a2a] transition-colors">{person.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
            [ 02 // CREW ]
          </div>
          <h2 className="font-sans font-extralight text-2xl tracking-tighter uppercase text-[#c8c4bc] mb-6">
            Key Crew
          </h2>
          <div className="space-y-4">
            {credits.crew.filter((c: any) => ["Director", "Screenplay", "Original Music Composer"].includes(c.job)).slice(0, 5).map((person: any, idx: number) => (
              <Link href={`/actor/${person.id}`} key={`${person.id}-${idx}`} className="flex justify-between items-center bg-[#c8c4bc]/[0.02] border border-[#c8c4bc]/10 p-4 rounded-xl hover:border-[#8b3a2a]/50 hover:bg-[#c8c4bc]/[0.04] transition-all cursor-pointer group">
                <p className="text-sm font-medium text-[#c8c4bc]">{person.name}</p>
                <p className="text-xs font-mono text-[#8b3a2a] uppercase">{person.job}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {recommendations.results.length > 0 && (
        <div className="mt-20">
          <div className="font-mono text-xs text-[#8b3a2a] tracking-[0.3em] uppercase mb-4">
            [ 03 // SIMILAR_MOVIES ]
          </div>
          <h2 className="font-sans font-extralight text-3xl sm:text-4xl tracking-tighter uppercase text-[#c8c4bc] mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.results.slice(0, 10).map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
