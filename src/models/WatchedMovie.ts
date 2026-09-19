import mongoose, { Schema, Document, models } from "mongoose";

export interface IWatchedMovie extends Document {
  userId: mongoose.Types.ObjectId;
  tmdbId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  genres: { id: number; name: string }[];
  releaseDate?: string;
  overview?: string;
  voteAverage?: number;
  runtime?: number;
  rating?: number;
  review?: string;
  watchedDate?: Date;
  isFavorite: boolean;
  director?: string;
  cast?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchedMovieSchema = new Schema<IWatchedMovie>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    posterPath: { type: String },
    backdropPath: { type: String },
    genres: [{ id: Number, name: String }],
    releaseDate: { type: String },
    overview: { type: String },
    voteAverage: { type: Number },
    runtime: { type: Number },
    rating: { type: Number, min: 1, max: 10 },
    review: { type: String },
    watchedDate: { type: Date },
    isFavorite: { type: Boolean, default: false },
    director: { type: String },
    cast: [{ type: String }],
  },
  { timestamps: true }
);

WatchedMovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });
WatchedMovieSchema.index({ userId: 1, createdAt: -1 });
WatchedMovieSchema.index({ userId: 1, "genres.id": 1 });

const WatchedMovie = models.WatchedMovie || mongoose.model<IWatchedMovie>("WatchedMovie", WatchedMovieSchema);
export default WatchedMovie;
