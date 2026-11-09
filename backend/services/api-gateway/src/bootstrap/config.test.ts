import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

const base = {
  NODE_ENV: "testing",
  ORIGIN: "http://localhost:5173",
  GRPC_AUTH_PORT: "50051",
};

describe("API Gateway environment", () => {
  test("uses the documented local defaults", () => {
    expect(parseConfig(base)).toMatchObject({
      PORT: 3000,
      SHUTDOWN_TIMEOUT_MS: 10_000,
      AUTH_SERVICE_URL: "http://auth-service:3000",
    });
  });

  test("accepts valid service URLs and port overrides", () => {
    expect(
      parseConfig({ ...base, PORT: "8081", AUTH_SERVICE_URL: "http://auth:3001" }),
    ).toMatchObject({
      PORT: 8081,
      AUTH_SERVICE_URL: "http://auth:3001",
    });
  });

  test("reports missing and invalid variables by name", () => {
    expect(() => parseConfig({})).toThrow("ORIGIN");
    expect(() => parseConfig({ ...base, PORT: "0" })).toThrow("PORT");
    expect(() => parseConfig({ ...base, AUTH_SERVICE_URL: "not-a-url" })).toThrow(
      "AUTH_SERVICE_URL",
    );
  });
});
