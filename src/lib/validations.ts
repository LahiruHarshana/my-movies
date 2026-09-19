import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const movieBaseSchema = z.object({
  tmdbId: z.number(),
  title: z.string(),
  posterPath: z.string().optional().nullable(),
  backdropPath: z.string().optional().nullable(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional().default([]),
  releaseDate: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  voteAverage: z.number().optional().nullable(),
});

export const addWatchedMovieSchema = movieBaseSchema.extend({
  runtime: z.number().optional().nullable(),
  rating: z.number().min(1).max(10).optional().nullable(),
  review: z.string().optional().nullable(),
  watchedDate: z.string().optional().nullable(),
  isFavorite: z.boolean().optional().default(false),
  director: z.string().optional().nullable(),
  cast: z.array(z.string()).optional().default([]),
});

export const addWatchlistMovieSchema = movieBaseSchema;

export const recommendationFeedbackSchema = z.object({
  tmdbId: z.number(),
  reason: z.string().max(200).optional(),
});
