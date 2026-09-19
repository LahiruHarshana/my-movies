import { NextResponse } from "next/server";
import { getTopRatedMovies } from "@/lib/tmdb";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const data = await getTopRatedMovies(page);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch top rated" }, { status: 500 });
  }
}
