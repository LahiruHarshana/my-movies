import { NextRequest, NextResponse } from "next/server";
import { getMovieRecommendations } from "@/lib/tmdb";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const movieIdStr = searchParams.get("movieId");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!movieIdStr) {
    return NextResponse.json({ error: "movieId parameter is required" }, { status: 400 });
  }

  const movieId = parseInt(movieIdStr, 10);
  
  try {
    const data = await getMovieRecommendations(movieId, page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recommendations" }, { status: 502 });
  }
}
