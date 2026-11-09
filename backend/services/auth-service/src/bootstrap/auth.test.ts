import { describe, expect, test } from "bun:test";
import { buildAuthOptions } from "./auth.ts";
import type { EnvType } from "./config.ts";
import { sendOtpEmail } from "./otp-delivery.ts";

const baseEnv: EnvType = {
  NODE_ENV: "testing",
  PORT: 3001,
  GRPC_AUTH_PORT: 50051,
  SHUTDOWN_TIMEOUT_MS: 10_000,
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:8080",
  MONGODB_URI: "mongodb://localhost:27017/deep_agent",
  RABBITMQ_URL: "amqp://localhost:5672",
  TRUSTED_ORIGINS: "http://localhost:5173, http://localhost:4173",
  NOTIFICATION_SERVICE_URL: "http://notification-service:3000",
  INTERNAL_SERVICE_TOKEN: "internal-secret",
};

describe("buildAuthOptions", () => {
  test("requires email verification and protects account linking", () => {
    const options = buildAuthOptions(baseEnv);

    expect(options.emailAndPassword).toMatchObject({
      enabled: true,
      requireEmailVerification: true,
    });
    expect(options.account?.accountLinking).toMatchObject({
      enabled: true,
      requireLocalEmailVerified: true,
      trustedProviders: ["google"],
    });
    expect(options.trustedOrigins).toEqual(["http://localhost:5173", "http://localhost:4173"]);
    expect(options.plugins?.map((plugin) => plugin.id)).toContain("email-otp");
  });

  test("adds Google only when both credentials exist", () => {
    expect(buildAuthOptions(baseEnv).socialProviders).toBeUndefined();

    const withGoogle = buildAuthOptions({
      ...baseEnv,
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
    });
    expect(withGoogle.socialProviders).toMatchObject({
      google: { clientId: "client-id", clientSecret: "client-secret" },
    });
  });
});

describe("sendOtpEmail", () => {
  test("posts the rendered OTP message to the notification service", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }) as unknown as typeof fetch;

    await sendOtpEmail({
      email: "user@example.test",
      otp: "123456",
      type: "email-verification",
      env: baseEnv,
      fetchImpl,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("http://notification-service:3000/internal/emails");
    expect(calls[0].init.headers).toMatchObject({ "x-internal-token": "internal-secret" });
    expect(String(calls[0].init.body)).toContain("123456");
    expect(String(calls[0].init.body)).toContain("verify your email");
  });

  test("fails when the notification service rejects the message", async () => {
    const fetchImpl = (async () => new Response(null, { status: 502 })) as unknown as typeof fetch;

    await expect(
      sendOtpEmail({
        email: "user@example.test",
        otp: "123456",
        type: "sign-in",
        env: baseEnv,
        fetchImpl,
      }),
    ).rejects.toThrow("OTP delivery failed");
  });
});
