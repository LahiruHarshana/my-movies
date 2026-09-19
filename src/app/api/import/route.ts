import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import { auth } from "@/auth";

// Basic fetch wrapper for server side to avoid using the cached tmdb.ts which might break on batch
async function fetchMovie(query: string, year?: string) {
  const apiKey = process.env.TMDB_API_KEY;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  if (year) url += `&primary_release_year=${year}`;
  
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  await connectDB();

  const movieList = [
    { title: "Thalapathi", year: "1991" },
    { title: "Real Steel", year: "2011" },
    { title: "Soodhu Kavvum", year: "2013" },
    { title: "Premam", year: "2015" },
    { title: "Dangal", year: "2016" },
    { title: "Vada Chennai", year: "2018" },
    { title: "Ratsasan", year: "2018" },
    { title: "Kaithi", year: "2019" },
    { title: "Asuran", year: "2019" },
    { title: "Soorarai Pottru", year: "2020" },
    { title: "Colour Photo", year: "2020" },
    { title: "Jai Bhim", year: "2021" },
    { title: "777 Charlie", year: "2022" },
    { title: "Sita Ramam", year: "2022" },
    { title: "Vikram", year: "2022" },
    { title: "RRR", year: "2022" },
    { title: "12th Fail", year: "2023" },
    { title: "King of Kotha", year: "2023" },
    { title: "Animal", year: "2023" },
    { title: "Kill", year: "2023" },
    { title: "Meiyazhagan", year: "2024" },
    { title: "Maharaja", year: "2024" },
    { title: "Kalki 2898 AD", year: "2024" },
    { title: "Marco", year: "2024" },
    { title: "Deva", year: "2025" },
    { title: "Chhaava", year: "2025" },
    { title: "Dhurandhar", year: "2025" },
    { title: "Baahubali: The Beginning", year: "2015" },
    { title: "Baahubali 2: The Conclusion", year: "2017" },
    { title: "Ponniyin Selvan: Part I", year: "2022" },
    { title: "Ponniyin Selvan: Part II", year: "2023" },
    { title: "Koi... Mil Gaya", year: "2003" },
    { title: "Krrish", year: "2006" },
    { title: "Krrish 3", year: "2013" },
    { title: "K.G.F: Chapter 1", year: "2018" },
    { title: "K.G.F: Chapter 2", year: "2022" },
    { title: "Saaho", year: "2019" },
    { title: "Salaar: Part 1 - Ceasefire", year: "2023" },
    { title: "War", year: "2019" },
    { title: "War 2", year: "2025" },
    { title: "Baaghi", year: "2016" },
    { title: "Baaghi 2", year: "2018" },
    { title: "Baaghi 3", year: "2020" },
    { title: "Singham", year: "2011" },
    { title: "Singham Returns", year: "2014" },
    { title: "Singham Again", year: "2024" },
    { title: "Singam", year: "2010" },
    { title: "Singam II", year: "2013" },
    { title: "Si3", year: "2017" },
    { title: "Love Mocktail", year: "2020" },
    { title: "Love Mocktail 2", year: "2022" },
    { title: "Baashha", year: "1995" },
    { title: "Padayappa", year: "1999" },
    { title: "Sivaji: The Boss", year: "2007" },
    { title: "Enthiran", year: "2010" },
    { title: "Kabali", year: "2016" },
    { title: "2.0", year: "2018" },
    { title: "Jailer", year: "2023" },
    { title: "Ghilli", year: "2004" },
    { title: "Pokkiri", year: "2007" },
    { title: "Thuppakki", year: "2012" },
    { title: "Kaththi", year: "2014" },
    { title: "Mersal", year: "2017" },
    { title: "Master", year: "2021" },
    { title: "Leo", year: "2023" },
    { title: "The Greatest of All Time", year: "2024" },
    { title: "Kaakha Kaakha", year: "2003" },
    { title: "Ghajini", year: "2005" },
    { title: "Vaaranam Aayiram", year: "2008" },
    { title: "24", year: "2016" },
    { title: "Pudhupettai", year: "2006" },
    { title: "Aadukalam", year: "2011" },
    { title: "Velaiilla Pattadhari", year: "2014" },
    { title: "Karnan", year: "2021" },
    { title: "Thiruchitrambalam", year: "2022" },
    { title: "Captain Miller", year: "2024" }
  ];

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  for (const m of movieList) {
    try {
      // Small delay to prevent TMDB rate limiting
      await new Promise(r => setTimeout(r, 200));
      
      const tmdbData = await fetchMovie(m.title, m.year);
      if (!tmdbData) {
        notFound++;
        continue;
      }

      const existing = await WatchedMovie.findOne({ userId, tmdbId: tmdbData.id });
      if (existing) {
        skipped++;
        continue;
      }

      await WatchedMovie.create({
        userId,
        tmdbId: tmdbData.id,
        title: tmdbData.title,
        posterPath: tmdbData.poster_path,
        backdropPath: tmdbData.backdrop_path,
        genres: tmdbData.genre_ids ? tmdbData.genre_ids.map((id: number) => ({ id, name: "Imported" })) : [],
        releaseDate: tmdbData.release_date,
        overview: tmdbData.overview,
        voteAverage: tmdbData.vote_average,
        watchedDate: new Date()
      });
      
      added++;
    } catch (e) {
      console.error(`Error importing ${m.title}`, e);
      skipped++;
    }
  }

  return NextResponse.json({ 
    message: "Import complete!",
    stats: {
      totalAttempted: movieList.length,
      successfullyAdded: added,
      alreadyExistedSkipped: skipped,
      notFoundOnTMDB: notFound
    }
  });
}
