import { connectDB } from "@/lib/mongodb";
import WatchlistMovie from "@/models/WatchlistMovie";
import { auth } from "@/auth";
import WatchlistClient from "@/components/movies/WatchlistClient";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const movies = await WatchlistMovie.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Deep clone to strip all nested Mongoose ObjectIds (like genre._id) for Next.js Client Components
  const serializedMovies = JSON.parse(JSON.stringify(movies));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span className="w-1 h-8 bg-[#8b3a2a] rounded-full"></span>
        My Watchlist
      </h1>

      {serializedMovies.length > 0 ? (
        <WatchlistClient movies={serializedMovies} />
      ) : (
        <div className="text-center text-[#c8c4bc]/50 mt-20 bg-[#1a1a1a] p-12 rounded-2xl border border-[#c8c4bc]/10">
          <p className="text-xl font-medium text-[#c8c4bc] mb-2">Your watchlist is empty.</p>
          <p className="text-sm">Discover movies and add them here to watch later!</p>
        </div>
      )}
    </div>
  );
}
