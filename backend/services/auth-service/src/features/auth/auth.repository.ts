import type { Model } from "mongoose";
import { UserModel, type User, type UserDocument } from "./auth.schema.js";

export class AuthRepo {
  constructor(private readonly userModel: Model<User> = UserModel) {}

  async create(user: User): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async updateById(id: string, updates: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }
}
