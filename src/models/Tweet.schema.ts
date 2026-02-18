import mongoose, { Document, Schema } from "mongoose";

export interface ITweet extends Document {
  user_id: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  video?: string;
  hashtags: string[];
  likes: mongoose.Types.ObjectId[];
  created_at: string;
}
const TweetSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 280,
    },
    image: {
      type: String,
      default: "",
    },
    video: {
      type: String,
      default: "",
    },
    hashtags: [
      {
        type: String,
        index: true, // Đánh index để tìm kiếm các bài viết theo hashtag nhanh hơn
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);
export default mongoose.model<ITweet>("Tweet", TweetSchema);
