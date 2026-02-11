import mongoose, { Schema } from "mongoose";

const FollowSchema = new Schema(
  {
    follower_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

FollowSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

export default mongoose.model("Follow", FollowSchema);
