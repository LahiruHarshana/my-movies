import { NextRequest, NextResponse } from "next/server";
import { getTrendingMovies } from "@/lib/tmdb";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const window = searchParams.get("window") as "day" | "week" || "week";
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const data = await getTrendingMovies(window, page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch trending movies" }, { status: 502 });
  }
}
