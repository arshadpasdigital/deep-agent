import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins/email-otp";
import { getEnv, type EnvType } from "./config.js";
import { MongodbClient } from "./mongodb.js";
import { sendOtpEmail as defaultSendOtpEmail } from "./otp-delivery.js";
import type { OtpType } from "./otp-email.js";

type MongoClient = Awaited<ReturnType<typeof MongodbClient.getClient>>;

export type SendOtp = (input: { email: string; otp: string; type: OtpType }) => Promise<void>;

export function buildAuthOptions(
  env: EnvType,
  sendOtp: SendOtp = (input) => defaultSendOtpEmail({ ...input, env }),
): Omit<BetterAuthOptions, "database"> {
  const trustedOrigins = env.TRUSTED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const socialProviders =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  return {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        requireLocalEmailVerified: true,
      },
    },
    socialProviders,
    trustedOrigins,
    plugins: [
      emailOTP({
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendOtp({ email, otp, type });
        },
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        sendVerificationOnSignUp: true,
        overrideDefaultEmailVerification: true,
        disableSignUp: true,
        rateLimit: { window: 60, max: 3 },
      }),
    ],
  };
}

function createAuth(client: MongoClient, env: EnvType) {
  return betterAuth({
    ...buildAuthOptions(env),
    database: mongodbAdapter(client.db(), { client, transaction: false }),
  });
}

export type Auth = ReturnType<typeof createAuth>;

export class AuthProvider {
  private static instance: Promise<Auth> | undefined;

  private constructor() {}

  static getInstance(): Promise<Auth> {
    AuthProvider.instance ??= MongodbClient.getClient().then((client) => createAuth(client, getEnv()));
    return AuthProvider.instance;
  }
}
