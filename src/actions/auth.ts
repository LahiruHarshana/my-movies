"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signupSchema } from "@/lib/validations";

export async function signup(formData: any) {
  try {
    const parsed = signupSchema.parse(formData);
    
    await connectDB();
    
    const existingUser = await User.findOne({ email: parsed.email });
    if (existingUser) {
      return { error: "An account with this email already exists" };
    }
    
    const hashedPassword = await bcrypt.hash(parsed.password, 12);
    
    await User.create({
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
    });
    
    return { success: true };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { error: error.errors[0].message };
    }
    return { error: error.message || "Failed to create account" };
  }
}
