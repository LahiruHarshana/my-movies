"use server";

import { connectDB } from "@/lib/mongodb";
import WatchedMovie from "@/models/WatchedMovie";
import { addWatchedMovieSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id; 
}

export async function addToWatched(formData: any) {
  try {
    await connectDB();
    const userId = await getUserId();
    const parsed = addWatchedMovieSchema.parse(formData);

    const existing = await WatchedMovie.findOne({ userId, tmdbId: parsed.tmdbId });
    if (existing) {
      return { error: "Movie is already in your watched list" };
    }

    const movie = await WatchedMovie.create({ ...parsed, userId });

    const WatchlistMovie = (await import("@/models/WatchlistMovie")).default;
    await WatchlistMovie.findOneAndDelete({ userId, tmdbId: parsed.tmdbId });

    revalidatePath("/watched");
    revalidatePath("/watchlist");
    revalidatePath("/recommendations");
    return { success: true, movie: JSON.parse(JSON.stringify(movie)) };
  } catch (error: any) {
    return { error: error.message || "Failed to add movie" };
  }
}

export async function removeFromWatched(tmdbId: number) {
  try {
    await connectDB();
    const userId = await getUserId();
    await WatchedMovie.findOneAndDelete({ userId, tmdbId });
    revalidatePath("/watched");
    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to remove movie" };
  }
}

export async function updateMovieRating(tmdbId: number, rating: number) {
  try {
    await connectDB();
    const userId = await getUserId();
    await WatchedMovie.findOneAndUpdate({ userId, tmdbId }, { rating });
    revalidatePath("/watched");
    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update rating" };
  }
}

export async function toggleFavorite(tmdbId: number) {
  try {
    await connectDB();
    const userId = await getUserId();
    const movie = await WatchedMovie.findOne({ userId, tmdbId });
    if (!movie) throw new Error("Movie not found");
    
    movie.isFavorite = !movie.isFavorite;
    await movie.save();
    revalidatePath("/watched");
    revalidatePath("/recommendations");
    return { success: true, isFavorite: movie.isFavorite };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle favorite" };
  }
}
