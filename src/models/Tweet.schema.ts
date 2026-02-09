import mongoose, { Document, Schema } from "mongoose";

export interface ITweet extends Document {
  user_id: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  video?: string;
  created_at: string;
}
const TweetSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
      index: true,
    },
    content: {
      type: String,
      require: true,
      kMaxLength: 280,
    },
    image: {
      type: String,
      default: "",
    },
    video: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);
export default mongoose.model<ITweet>("Tweet", TweetSchema);
