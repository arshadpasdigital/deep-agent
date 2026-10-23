import mongoose from "mongoose";
import { env } from "./config.js";

export class MongodbClient {
  private static instance: MongodbClient | undefined;

  private constructor() {}

  static getInstance(): MongodbClient {
    MongodbClient.instance ??= new MongodbClient();
    return MongodbClient.instance;
  }

  static async getClient(): Promise<ReturnType<typeof mongoose.connection.getClient>> {
    await MongodbClient.connected();
    return mongoose.connection.getClient();
  }

  static async connected(): Promise<typeof mongoose> {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    await mongoose.connect(env.MONGODB_URI);
    return mongoose;
  }

  static async closeConnection(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}
