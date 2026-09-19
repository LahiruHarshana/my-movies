import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  
  // Find movies that don't have a director yet
  const moviesToEnrich = await WatchedMovie.find({ 
    userId: session.user.id,
    $or: [
      { director: { $exists: false } },
      { director: null },
      { cast: { $size: 0 } }
    ]
  }).limit(50); // Limit to 50 at a time to prevent Vercel/Node timeouts

  if (moviesToEnrich.length === 0) {
    return NextResponse.json({ message: "All movies are fully enriched!" });
  }

  let enrichedCount = 0;
  const apiKey = process.env.TMDB_API_KEY;

  for (const movie of moviesToEnrich) {
    try {
      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 100));

      // Fetch detailed movie info including credits
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${apiKey}&append_to_response=credits`);
      if (!res.ok) continue;

      const data = await res.json();
      
      // Extract director and cast
      const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name;
      const cast = data.credits?.cast?.slice(0, 3).map((c: any) => c.name) || [];
      const runtime = data.runtime || movie.runtime;
      
      // Fix genres if they were imported loosely
      const genres = data.genres ? data.genres.map((g: any) => ({ id: g.id, name: g.name })) : movie.genres;

      movie.director = director;
      movie.cast = cast;
      movie.runtime = runtime;
      movie.genres = genres;

      await movie.save();
      enrichedCount++;
    } catch (e) {
      console.error(`Failed to enrich ${movie.title}`, e);
    }
  }

  return NextResponse.json({ 
    message: `Successfully enriched ${enrichedCount} movies with directors, actors, and runtime!`,
    remainingToEnrich: await WatchedMovie.countDocuments({ 
      userId: session.user.id,
      $or: [
        { director: { $exists: false } },
        { director: null },
        { cast: { $size: 0 } }
      ]
    })
  });
}
