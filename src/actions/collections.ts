"use server";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function createCollection(formData: FormData) {
  try {
    await connectDB();
    const userId = await getUserId();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    const parsed = createSchema.parse({ name, description });
    
    const existing = await Collection.findOne({ userId, name: parsed.name });
    if (existing) throw new Error("A collection with this name already exists");

    const collection = await Collection.create({
      userId,
      name: parsed.name,
      description: parsed.description,
      movies: []
    });

    revalidatePath("/collections");
    return { success: true, collectionId: collection._id.toString() };
  } catch (error: any) {
    return { error: error.message || "Failed to create collection" };
  }
}

export async function getUserCollections() {
  try {
    await connectDB();
    const userId = await getUserId();
    const collections = await Collection.find({ userId }).sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(collections));
  } catch (error) {
    return [];
  }
}

export async function addMovieToCollection(collectionId: string, movie: { tmdbId: number, title: string, posterPath?: string }) {
  try {
    await connectDB();
    const userId = await getUserId();
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new Error("Collection not found");

    if (collection.movies.some((m: any) => m.tmdbId === movie.tmdbId)) {
      return { error: "Movie already in this collection" };
    }

    const order = collection.movies.length;
    collection.movies.push({ ...movie, order });
    
    // Set cover image if it's the first movie
    if (collection.movies.length === 1 && movie.posterPath) {
      collection.coverImage = movie.posterPath;
    }
    
    await collection.save();
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to add movie" };
  }
}

export async function removeMovieFromCollection(collectionId: string, tmdbId: number) {
  try {
    await connectDB();
    const userId = await getUserId();
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new Error("Collection not found");

    collection.movies = collection.movies.filter((m: any) => m.tmdbId !== tmdbId);
    await collection.save();
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to remove movie" };
  }
}

export async function reorderCollection(collectionId: string, orderedMovieIds: number[]) {
  try {
    await connectDB();
    const userId = await getUserId();
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new Error("Collection not found");

    collection.movies.forEach((m: any) => {
      const newIndex = orderedMovieIds.indexOf(m.tmdbId);
      if (newIndex !== -1) m.order = newIndex;
    });

    collection.movies.sort((a: any, b: any) => a.order - b.order);
    await collection.save();
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to reorder" };
  }
}
