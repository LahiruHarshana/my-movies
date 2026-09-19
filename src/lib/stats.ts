import { connectDB } from "./mongodb";
import WatchedMovie from "@/models/WatchedMovie";

export async function getUserStats(userId: string) {
  await connectDB();
  
  const watched = await WatchedMovie.find({ userId }).lean();
  
  // Basic aggregates
  const totalWatched = watched.length;
  const totalRuntime = watched.reduce((sum, m) => sum + (m.runtime || 0), 0);
  
  // Ratings: Use personal rating, fallback to TMDB voteAverage rounded
  const ratedMovies = watched.filter(m => m.rating != null || m.voteAverage != null);
  
  const avgRating = ratedMovies.length > 0 
    ? (ratedMovies.reduce((sum, m) => sum + (m.rating || m.voteAverage || 0), 0) / ratedMovies.length).toFixed(1)
    : "N/A";
  
  const ratingDistribution = Array(10).fill(0);
  ratedMovies.forEach(m => {
    // If user hasn't rated it personally, use TMDB's voteAverage (rounded)
    const ratingValue = m.rating || Math.round(m.voteAverage || 0);
    if (ratingValue >= 1 && ratingValue <= 10) {
      ratingDistribution[ratingValue - 1]++;
    }
  });

  // Genres
  const genreCounts: Record<string, number> = {};
  watched.forEach(m => {
    m.genres?.forEach(g => {
      // Ignore the "Imported" placeholder genre if we didn't map real genres perfectly
      if (g.name && g.name !== "Imported") {
        genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
      }
    });
  });
  
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Directors & Cast
  const directorCounts: Record<string, number> = {};
  const castCounts: Record<string, number> = {};
  
  watched.forEach(m => {
    if (m.director) directorCounts[m.director] = (directorCounts[m.director] || 0) + 1;
    m.cast?.forEach(c => {
      castCounts[c] = (castCounts[c] || 0) + 1;
    });
  });

  const topDirectors = Object.entries(directorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  const topCast = Object.entries(castCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Monthly Activity (Last 6 months)
  const monthlyActivity = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    
    // Count movies watched in this month
    const count = watched.filter(m => {
      const watchedDate = m.watchedDate || m.createdAt;
      const wd = new Date(watchedDate);
      return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
    }).length;
    
    monthlyActivity.push({ month: monthName, count });
  }

  return {
    totalWatched,
    totalRuntimeHours: Math.round(totalRuntime / 60),
    avgRating,
    topGenres,
    topDirectors,
    topCast,
    ratingDistribution: ratingDistribution.map((count, i) => ({ rating: i + 1, count })),
    monthlyActivity
  };
}
