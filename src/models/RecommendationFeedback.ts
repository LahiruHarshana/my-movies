import mongoose, { Schema, Document, models } from "mongoose";

export interface IRecommendationFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  tmdbId: number;
  type: "not_interested";
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tmdbId: { type: Number, required: true },
    type: { type: String, enum: ["not_interested"], required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

RecommendationFeedbackSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });
RecommendationFeedbackSchema.index({ userId: 1, type: 1, createdAt: -1 });

const RecommendationFeedback =
  models.RecommendationFeedback ||
  mongoose.model<IRecommendationFeedback>("RecommendationFeedback", RecommendationFeedbackSchema);

export default RecommendationFeedback;
