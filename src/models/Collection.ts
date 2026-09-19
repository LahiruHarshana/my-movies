import mongoose, { Schema, Document, models } from "mongoose";

export interface ICollectionMovie {
  tmdbId: number;
  title: string;
  posterPath?: string;
  order: number;
}

export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  coverImage?: string;
  movies: ICollectionMovie[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionMovieSchema = new Schema<ICollectionMovie>({
  tmdbId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  order: { type: Number, required: true, default: 0 },
});

const CollectionSchema = new Schema<ICollection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    movies: [CollectionMovieSchema],
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

const Collection = models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema);
export default Collection;
