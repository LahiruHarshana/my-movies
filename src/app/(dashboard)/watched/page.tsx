import { connectDB } from "@/lib/mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import { auth } from "@/auth";
import WatchlistClient from "@/components/movies/WatchlistClient";
import { CheckCircle } from "lucide-react";

export default async function WatchedPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const movies = await WatchedMovie.find({ userId: session.user.id })
    .sort({ watchedDate: -1, createdAt: -1 })
    .lean();

  // Deep clone to strip all nested Mongoose ObjectIds (like genre._id) for Next.js Client Components
  const serializedMovies = JSON.parse(JSON.stringify(movies));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <CheckCircle className="w-8 h-8 text-#c8c4bc" />
        Watched History
      </h1>

      {serializedMovies.length > 0 ? (
        <WatchlistClient movies={serializedMovies} />
      ) : (
        <div className="text-center text-[#c8c4bc]/50 mt-20 bg-[#1a1a1a] p-12 rounded-2xl border border-[#c8c4bc]/10">
          <p className="text-xl font-medium text-[#c8c4bc] mb-2">You haven't watched any movies yet.</p>
          <p className="text-sm">Mark movies as watched to build your history!</p>
        </div>
      )}
    </div>
  );
}
