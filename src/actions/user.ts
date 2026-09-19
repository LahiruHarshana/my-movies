"use server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio is too long").optional(),
  favoriteGenres: z.array(z.number()),
});

export async function updateProfile(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const parsed = profileSchema.parse(data);
    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      name: parsed.name,
      bio: parsed.bio,
      favoriteGenres: parsed.favoriteGenres,
    });

    revalidatePath("/profile");
    revalidatePath("/recommendations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile" };
  }
}
