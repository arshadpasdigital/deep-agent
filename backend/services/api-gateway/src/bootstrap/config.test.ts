import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

describe("API Gateway environment", () => {
  test("uses the documented local defaults", () => {
    expect(parseConfig({})).toMatchObject({
      port: 3000,
      shutdownTimeoutMs: 10_000,
      authServiceUrl: "http://auth-service:3000",
    });
  });

  test("accepts valid service URLs and port overrides", () => {
    expect(parseConfig({ PORT: "8081", AUTH_SERVICE_URL: "http://auth:3001/" })).toMatchObject({
      port: 8081,
      authServiceUrl: "http://auth:3001",
    });
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ PORT: "0", AUTH_SERVICE_URL: "not-a-url" })).toThrow("PORT");
    expect(() => parseConfig({ AUTH_SERVICE_URL: "not-a-url" })).toThrow("AUTH_SERVICE_URL");
  });
});
