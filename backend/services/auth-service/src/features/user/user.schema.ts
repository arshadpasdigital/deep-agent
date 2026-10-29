import mongoose, { type HydratedDocument } from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<User>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, required: true, default: false },
    image: { type: String, default: null },
  },
  { timestamps: true, collection: "user", versionKey: false },
);

export type UserDocument = HydratedDocument<User>;

export const UserModel = mongoose.models.User ?? mongoose.model<User>("User", userSchema);
