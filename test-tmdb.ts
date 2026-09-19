import { discoverMovies } from "./src/lib/tmdb";

async function run() {
  const res = await discoverMovies({
    sort_by: "vote_average.desc",
    "vote_count.gte": "1000",
    with_genres: "28",
    primary_release_year: "2025"
  });
  console.log("Total Pages:", res.total_pages);
  console.log("Total Results:", res.total_results);
}
run();
