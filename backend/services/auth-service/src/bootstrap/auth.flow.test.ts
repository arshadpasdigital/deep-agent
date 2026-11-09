import { describe, expect, test } from "bun:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { buildAuthOptions } from "./auth.ts";
import type { EnvType } from "./config.ts";
import type { OtpType } from "./otp-email.ts";

const env: EnvType = {
  NODE_ENV: "testing",
  PORT: 3001,
  GRPC_AUTH_PORT: 50051,
  SHUTDOWN_TIMEOUT_MS: 10_000,
  BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret",
  BETTER_AUTH_URL: "http://localhost:8080",
  MONGODB_URI: "mongodb://localhost:27017/deep_agent",
  RABBITMQ_URL: "amqp://localhost:5672",
  TRUSTED_ORIGINS: "http://localhost:5173",
  NOTIFICATION_SERVICE_URL: "http://notification-service:3000",
  INTERNAL_SERVICE_TOKEN: "internal-secret",
};

type MemoryDb = {
  user: any[];
  session: any[];
  account: any[];
  verification: any[];
};

function createTestAuth() {
  const db: MemoryDb = { user: [], session: [], account: [], verification: [] };
  const otps: { email: string; otp: string; type: OtpType }[] = [];
  const auth = betterAuth({
    ...buildAuthOptions(env, async (input) => {
      otps.push(input);
    }),
    database: memoryAdapter(db),
    rateLimit: { enabled: false },
  });
  return { auth, db, otps };
}

async function call(
  auth: ReturnType<typeof createTestAuth>["auth"],
  method: string,
  path: string,
  body?: unknown,
  cookie?: string,
) {
  const response = await auth.handler(
    new Request(`http://localhost:8080${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:5173",
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const text = await response.text();
  const cookies = response.headers.getSetCookie();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : undefined,
    cookie: cookies.map((value) => value.split(";")[0]).join("; "),
    setCookie: cookies,
  };
}

function latestOtp(otps: { otp: string; type: OtpType }[], type: OtpType): string {
  const match = [...otps].reverse().find((entry) => entry.type === type);
  if (!match) throw new Error(`No ${type} OTP was sent`);
  return match.otp;
}

describe("Better Auth registration and verification", () => {
  test("sign-up sends a verification code and leaves the email unverified", async () => {
    const { auth, otps } = createTestAuth();
    const email = "new@example.test";

    const response = await call(auth, "POST", "/api/auth/sign-up/email", {
      name: "New User",
      email,
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ email, emailVerified: false });
    expect(response.cookie).toBe("");
    expect(otps).toHaveLength(1);
    expect(otps[0]).toMatchObject({ email, type: "email-verification" });
  });

  test("rejects password sign-in until the email is verified", async () => {
    const { auth, otps } = createTestAuth();
    const email = "unverified@example.test";
    const password = "password123";
    await call(auth, "POST", "/api/auth/sign-up/email", { name: "U", email, password });

    const rejected = await call(auth, "POST", "/api/auth/sign-in/email", { email, password });
    expect(rejected.status).toBe(403);
    expect(rejected.body.code).toBe("EMAIL_NOT_VERIFIED");

    const verified = await call(auth, "POST", "/api/auth/email-otp/verify-email", {
      email,
      otp: latestOtp(otps, "email-verification"),
    });
    expect(verified.status).toBe(200);
    expect(verified.body.user.emailVerified).toBe(true);

    const signedIn = await call(auth, "POST", "/api/auth/sign-in/email", { email, password });
    expect(signedIn.status).toBe(200);
    expect(signedIn.setCookie.some((value) => value.includes("HttpOnly"))).toBe(true);

    const session = await call(auth, "GET", "/api/auth/get-session", undefined, signedIn.cookie);
    expect(session.status).toBe(200);
    expect(session.body.user).toMatchObject({ email });

    const signedOut = await call(auth, "POST", "/api/auth/sign-out", {}, signedIn.cookie);
    expect(signedOut.status).toBe(200);
    expect(signedOut.setCookie.join(" ")).toContain("Max-Age=0");
  });

  test("limits wrong codes and invalidates the code after the allowed attempts", async () => {
    const { auth, otps } = createTestAuth();
    const email = "attempts@example.test";
    await call(auth, "POST", "/api/auth/sign-up/email", {
      name: "Attempts",
      email,
      password: "password123",
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await call(auth, "POST", "/api/auth/email-otp/verify-email", {
        email,
        otp: "000000",
      });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe("INVALID_OTP");
    }

    const exhausted = await call(auth, "POST", "/api/auth/email-otp/verify-email", {
      email,
      otp: latestOtp(otps, "email-verification"),
    });
    expect(exhausted.status).toBe(403);
    expect(exhausted.body.code).toBe("TOO_MANY_ATTEMPTS");
  });

  test("rejects an expired code", async () => {
    const { auth, db, otps } = createTestAuth();
    const email = "expired@example.test";
    await call(auth, "POST", "/api/auth/sign-up/email", {
      name: "Expired",
      email,
      password: "password123",
    });
    for (const row of db.verification) row.expiresAt = new Date(Date.now() - 1_000);

    const response = await call(auth, "POST", "/api/auth/email-otp/verify-email", {
      email,
      otp: latestOtp(otps, "email-verification"),
    });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("OTP_EXPIRED");
  });

  test("does not create a duplicate account or disclose the existing one", async () => {
    const { auth, db, otps } = createTestAuth();
    const email = "duplicate@example.test";
    const password = "password123";
    await call(auth, "POST", "/api/auth/sign-up/email", { name: "First", email, password });
    await call(auth, "POST", "/api/auth/email-otp/verify-email", {
      email,
      otp: latestOtp(otps, "email-verification"),
    });

    const existingId = db.user[0].id;
    const duplicate = await call(auth, "POST", "/api/auth/sign-up/email", {
      name: "Second",
      email,
      password: "password456",
    });

    expect(db.user).toHaveLength(1);
    expect(duplicate.body.user.id).not.toBe(existingId);
    expect(duplicate.cookie).toBe("");
  });
});

describe("Better Auth email-code sign-in", () => {
  test("starts a session for a verified user", async () => {
    const { auth, otps } = createTestAuth();
    const email = "code@example.test";
    const password = "password123";
    await call(auth, "POST", "/api/auth/sign-up/email", { name: "Code", email, password });
    await call(auth, "POST", "/api/auth/email-otp/verify-email", {
      email,
      otp: latestOtp(otps, "email-verification"),
    });

    const requested = await call(auth, "POST", "/api/auth/email-otp/send-verification-otp", {
      email,
      type: "sign-in",
    });
    expect(requested.status).toBe(200);

    const signedIn = await call(auth, "POST", "/api/auth/sign-in/email-otp", {
      email,
      otp: latestOtp(otps, "sign-in"),
    });
    expect(signedIn.status).toBe(200);
    expect(signedIn.cookie).toContain("better-auth.session_token");
  });

  test("does not reveal an unknown email and sends nothing", async () => {
    const { auth, otps } = createTestAuth();

    const response = await call(auth, "POST", "/api/auth/email-otp/send-verification-otp", {
      email: "missing@example.test",
      type: "sign-in",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(otps).toHaveLength(0);
  });

  test("does not start a session for an unverified email until the code is confirmed", async () => {
    const { auth, otps } = createTestAuth();
    const email = "pending@example.test";
    await call(auth, "POST", "/api/auth/sign-up/email", {
      name: "Pending",
      email,
      password: "password123",
    });
    await call(auth, "POST", "/api/auth/email-otp/send-verification-otp", {
      email,
      type: "sign-in",
    });

    const wrong = await call(auth, "POST", "/api/auth/sign-in/email-otp", {
      email,
      otp: "000000",
    });
    expect(wrong.status).toBe(400);
    expect(wrong.cookie).toBe("");

    const confirmed = await call(auth, "POST", "/api/auth/sign-in/email-otp", {
      email,
      otp: latestOtp(otps, "sign-in"),
    });
    expect(confirmed.status).toBe(200);
    expect(confirmed.cookie).toContain("better-auth.session_token");
  });
});
