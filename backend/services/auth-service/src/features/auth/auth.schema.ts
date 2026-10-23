import mongoose, { type HydratedDocument } from "mongoose";

export interface User {
  name: string;
  email: string;
  image: string;
  access_token: string;
  refresh_token: string;
}

const userSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, required: true, trim: true },
    access_token: { type: String, required: true, select: false },
    refresh_token: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<User>;

export const UserModel = mongoose.models.User ?? mongoose.model<User>("User", userSchema);
