import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

const base = {
  NODE_ENV: "testing",
  GRPC_AUTH_PORT: "50051",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:8080",
  MONGODB_URI: "mongodb://localhost:27017/deep_agent",
};

describe("Auth Service environment", () => {
  test("uses the port, shutdown, and origin defaults", () => {
    expect(parseConfig(base)).toMatchObject({
      PORT: 3001,
      SHUTDOWN_TIMEOUT_MS: 10_000,
      TRUSTED_ORIGINS: "http://localhost:5173",
      NOTIFICATION_SERVICE_URL: "http://notification-service:3000",
      INTERNAL_SERVICE_TOKEN: "local-development-only",
    });
  });

  test("accepts Google credentials as a pair", () => {
    expect(
      parseConfig({
        ...base,
        GOOGLE_CLIENT_ID: "client-id",
        GOOGLE_CLIENT_SECRET: "client-secret",
      }),
    ).toMatchObject({ GOOGLE_CLIENT_ID: "client-id", GOOGLE_CLIENT_SECRET: "client-secret" });
  });

  test("requires both Google values or neither", () => {
    expect(() => parseConfig({ ...base, GOOGLE_CLIENT_ID: "client-id" })).toThrow(
      "GOOGLE_CLIENT_SECRET",
    );
    expect(() => parseConfig({ ...base, GOOGLE_CLIENT_SECRET: "client-secret" })).toThrow(
      "GOOGLE_CLIENT_SECRET",
    );
  });

  test("requires a real internal token in production", () => {
    expect(() => parseConfig({ ...base, NODE_ENV: "production" })).toThrow(
      "INTERNAL_SERVICE_TOKEN",
    );
    expect(
      parseConfig({
        ...base,
        NODE_ENV: "production",
        INTERNAL_SERVICE_TOKEN: "a-real-secret",
      }),
    ).toMatchObject({ INTERNAL_SERVICE_TOKEN: "a-real-secret" });
  });

  test("reports missing and invalid variables by name", () => {
    expect(() => parseConfig({})).toThrow("MONGODB_URI");
    expect(() => parseConfig({ ...base, PORT: "invalid" })).toThrow("PORT");
    expect(() => parseConfig({ ...base, MONGODB_URI: "http://mongo:27017" })).toThrow(
      "MONGODB_URI",
    );
  });
});
