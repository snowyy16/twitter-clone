import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatar: string;
  created_at: Date;
}
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
