import { auth } from "@/auth";
import { getUserStats } from "@/lib/stats";
import GenreChart from "@/components/stats/GenreChart";
import ActivityChart from "@/components/stats/ActivityChart";
import RatingChart from "@/components/stats/RatingChart";
import { BarChart3, Clock, Film, Star } from "lucide-react";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stats = await getUserStats(session.user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <BarChart3 className="w-8 h-8 text-[#8b3a2a]" />
        Your Statistics
      </h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#c8c4bc]/50 font-medium">
            <Film className="w-5 h-5 text-indigo-400" />
            Total Watched
          </div>
          <p className="text-3xl font-bold">{stats.totalWatched}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#c8c4bc]/50 font-medium">
            <Clock className="w-5 h-5 text-#c8c4bc" />
            Total Hours
          </div>
          <p className="text-3xl font-bold">{stats.totalRuntimeHours}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#c8c4bc]/50 font-medium">
            <Star className="w-5 h-5 text-amber-400" />
            Avg Rating
          </div>
          <p className="text-3xl font-bold">{stats.avgRating}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#c8c4bc]/50 font-medium">
            <BarChart3 className="w-5 h-5 text-[#8b3a2a]" />
            Top Genre
          </div>
          <p className="text-2xl font-bold line-clamp-1">{stats.topGenres[0]?.name || "N/A"}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6">Top Genres</h2>
          <GenreChart data={stats.topGenres} />
        </div>

        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6">Movies per Month (Last 6 Mos)</h2>
          <ActivityChart data={stats.monthlyActivity} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6">Rating Distribution</h2>
          <RatingChart data={stats.ratingDistribution} />
        </div>

        <div className="bg-[#1a1a1a] border border-[#c8c4bc]/10 p-6 rounded-2xl flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-#c8c4bc">Top Directors</h2>
            {stats.topDirectors.length > 0 ? (
              <ul className="space-y-3">
                {stats.topDirectors.map(([name, count], i) => (
                  <li key={name} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-[#c8c4bc]/40 font-mono">{i + 1}.</span> {name}
                    </span>
                    <span className="bg-[#c8c4bc]/10 px-2 py-0.5 rounded-full text-xs">{count}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-[#c8c4bc]/50 text-sm">No data yet.</p>}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Top Actors</h2>
            {stats.topCast.length > 0 ? (
              <ul className="space-y-3">
                {stats.topCast.map(([name, count], i) => (
                  <li key={name} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-[#c8c4bc]/40 font-mono">{i + 1}.</span> {name}
                    </span>
                    <span className="bg-[#c8c4bc]/10 px-2 py-0.5 rounded-full text-xs">{count}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-[#c8c4bc]/50 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
