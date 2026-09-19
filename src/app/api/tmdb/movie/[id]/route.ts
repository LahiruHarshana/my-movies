import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, getMovieCredits } from "@/lib/tmdb";
import { auth } from "@/auth";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const [details, credits] = await Promise.all([
      getMovieDetails(id),
      getMovieCredits(id)
    ]);
    
    return NextResponse.json({ ...details, credits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch movie details" }, { status: 502 });
  }
}
