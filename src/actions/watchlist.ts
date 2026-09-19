"use server";

import { connectDB } from "@/lib/mongodb";
import WatchlistMovie from "@/models/WatchlistMovie";
import WatchedMovie from "@/models/WatchedMovie";
import { addWatchlistMovieSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id; 
}

export async function addToWatchlist(formData: any) {
  try {
    await connectDB();
    const userId = await getUserId();
    const parsed = addWatchlistMovieSchema.parse(formData);

    const existing = await WatchlistMovie.findOne({ userId, tmdbId: parsed.tmdbId });
    if (existing) {
      return { error: "Movie is already in your watchlist" };
    }
    
    const existingWatched = await WatchedMovie.findOne({ userId, tmdbId: parsed.tmdbId });
    if (existingWatched) {
      return { error: "Movie is already in your watched list" };
    }

    const movie = await WatchlistMovie.create({ ...parsed, userId });
    revalidatePath("/watchlist");
    revalidatePath("/recommendations");
    return { success: true, movie: JSON.parse(JSON.stringify(movie)) };
  } catch (error: any) {
    return { error: error.message || "Failed to add movie to watchlist" };
  }
}

export async function removeFromWatchlist(tmdbId: number) {
  try {
    await connectDB();
    const userId = await getUserId();
    await WatchlistMovie.findOneAndDelete({ userId, tmdbId });
    revalidatePath("/watchlist");
    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to remove movie" };
  }
}

export async function updatePriority(tmdbId: number, priority: "high" | "medium" | "low") {
  try {
    await connectDB();
    const userId = await getUserId();
    await WatchlistMovie.findOneAndUpdate({ userId, tmdbId }, { priority });
    revalidatePath("/watchlist");
    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update priority" };
  }
}
