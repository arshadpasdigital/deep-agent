import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongodbClient } from "./mongodb.js";

type MongoClient = Awaited<ReturnType<typeof MongodbClient.getClient>>;

function createAuth(client: MongoClient) {
  return betterAuth({
    database: mongodbAdapter(client.db(), { client }),
    emailAndPassword: { enabled: true },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export class AuthProvider {
  private static instance: Promise<Auth> | undefined;

  private constructor() {}

  static getInstance(): Promise<Auth> {
    AuthProvider.instance ??= MongodbClient.getClient().then(createAuth);
    return AuthProvider.instance;
  }
}
