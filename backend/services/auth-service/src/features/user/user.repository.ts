import type { Model } from "mongoose";
import { UserModel, type User, type UserDocument } from "./user.schema.js";

export class UserRepository {
  constructor(private readonly userModel: Model<User> = UserModel) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }
}
