import mongoose, { Document, Schema } from "mongoose";
export interface IMessage extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
  content: string;
}
const MessageSchema = new Schema(
  {
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    is_seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model<IMessage>("Message", MessageSchema);
