import { connectDB } from "@/lib/mongodb";
import Collection, { ICollection } from "@/models/Collection";
import { auth } from "@/auth";
import { FolderHeart } from "lucide-react";
import MovieCard from "@/components/movies/MovieCard";

export default async function SingleCollectionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const collection = await Collection.findOne({ _id: params.id, userId: session.user.id }).lean<ICollection>();

  if (!collection) {
    return <div className="text-center mt-20 text-[#c8c4bc]/50">Collection not found.</div>;
  }

  // Sort movies by order
  const sortedMovies = [...collection.movies].sort((a: any, b: any) => a.order - b.order);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderHeart className="w-8 h-8 text-[#8b3a2a]" />
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-[#c8c4bc]/50 mt-2">{collection.description}</p>
        )}
      </div>

      {sortedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {sortedMovies.map((movie: any) => (
            <MovieCard 
              key={movie.tmdbId} 
              movie={{
                id: movie.tmdbId,
                title: movie.title,
                poster_path: movie.posterPath,
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-[#c8c4bc]/50 mt-20">
          <p>This collection is empty.</p>
        </div>
      )}
    </div>
  );
}
