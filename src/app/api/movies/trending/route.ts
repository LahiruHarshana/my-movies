import { NextResponse } from "next/server";
import { getTrendingMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    
    // First argument is window ("week" or "day"), second is page
    const data = await getTrendingMovies("week", page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
