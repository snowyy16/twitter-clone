import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  tweet_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  content: string;
}
const CommentSchema: Schema = new Schema(
  {
    tweet_id: { type: Schema.Types.ObjectId, ref: "Tweet", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxLength: 280 },
  },
  { timestamps: true },
);
export default mongoose.model<IComment>("Comment", CommentSchema);
