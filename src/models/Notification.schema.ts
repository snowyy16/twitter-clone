import mongoose, { Document, Schema } from "mongoose";
import { ref } from "node:process";

export interface INotification extends Document {
  recipient_id: mongoose.Types.ObjectId;
  sender_id: mongoose.Types.ObjectId;
  type: "like" | "comment" | "follow";
  tweet_id?: mongoose.Types.ObjectId;
  is_read: boolean;
}
const NotificationSchema = new Schema(
  {
    recipient_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow"], required: true },
    tweet_id: { type: Schema.Types.ObjectId, ref: "Tweet" },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
