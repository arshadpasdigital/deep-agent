import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongodbClient } from "./mongodb.js";

const client = await MongodbClient.getClient();

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { client }),
});
