import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

const base = {
  NODE_ENV: "testing",
  PORT: "3003",
  GRPC_NOTIFICATION_PORT: "50053",
};

describe("Notification Service environment", () => {
  test("uses defaults while mail credentials remain optional", () => {
    expect(parseConfig(base)).toMatchObject({
      PORT: 3003,
      SHUTDOWN_TIMEOUT_MS: 10_000,
      EMAIL_PORT: 587,
      EMAIL_SECURE: false,
      INTERNAL_SERVICE_TOKEN: "local-development-only",
    });
  });

  test("accepts service-specific values", () => {
    expect(
      parseConfig({
        ...base,
        PORT: "3100",
        EMAIL_FROM: "notifications@example.test",
        EMAIL_HOST: "smtp.example.test",
      }),
    ).toMatchObject({
      PORT: 3100,
      EMAIL_FROM: "notifications@example.test",
      EMAIL_HOST: "smtp.example.test",
    });
  });

  test("requires mail settings and a real token in production", () => {
    expect(() => parseConfig({ ...base, NODE_ENV: "production" })).toThrow("EMAIL_HOST");

    expect(
      parseConfig({
        ...base,
        NODE_ENV: "production",
        EMAIL_HOST: "smtp.example.test",
        EMAIL_FROM: "notifications@example.test",
        INTERNAL_SERVICE_TOKEN: "a-real-secret",
      }),
    ).toMatchObject({ NODE_ENV: "production", INTERNAL_SERVICE_TOKEN: "a-real-secret" });
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ ...base, PORT: "70000" })).toThrow("PORT");
    expect(() => parseConfig({ ...base, SHUTDOWN_TIMEOUT_MS: "0" })).toThrow(
      "SHUTDOWN_TIMEOUT_MS",
    );
  });
});
