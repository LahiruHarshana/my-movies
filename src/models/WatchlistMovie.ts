import mongoose, { Schema, Document, models } from "mongoose";

export interface IWatchlistMovie extends Document {
  userId: mongoose.Types.ObjectId;
  tmdbId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  genres: { id: number; name: string }[];
  releaseDate?: string;
  overview?: string;
  voteAverage?: number;
  priority: "high" | "medium" | "low";
  addedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistMovieSchema = new Schema<IWatchlistMovie>(
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
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    addedReason: { type: String },
  },
  { timestamps: true }
);

WatchlistMovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });
WatchlistMovieSchema.index({ userId: 1, priority: 1, createdAt: -1 });

const WatchlistMovie = models.WatchlistMovie || mongoose.model<IWatchlistMovie>("WatchlistMovie", WatchlistMovieSchema);
export default WatchlistMovie;
