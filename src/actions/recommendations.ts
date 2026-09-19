"use server";

import { connectDB } from "@/lib/mongodb";
import RecommendationFeedback from "@/models/RecommendationFeedback";
import { recommendationFeedbackSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function dismissRecommendation(tmdbId: number, reason?: string) {
  try {
    await connectDB();
    const userId = await getUserId();
    const parsed = recommendationFeedbackSchema.parse({ tmdbId, reason });

    await RecommendationFeedback.findOneAndUpdate(
      { userId, tmdbId: parsed.tmdbId },
      { userId, tmdbId: parsed.tmdbId, type: "not_interested", reason: parsed.reason },
      { upsert: true, new: true }
    );

    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dismiss recommendation";
    return { error: message };
  }
}

export async function undoDismissRecommendation(tmdbId: number) {
  try {
    await connectDB();
    const userId = await getUserId();

    await RecommendationFeedback.findOneAndDelete({
      userId,
      tmdbId,
      type: "not_interested",
    });

    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to undo dismissal";
    return { error: message };
  }
}
