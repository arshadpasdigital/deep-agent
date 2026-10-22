import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

describe("Notification Service environment", () => {
  test("uses defaults while provider credentials remain optional", () => {
    expect(parseConfig({})).toMatchObject({ port: 3000, shutdownTimeoutMs: 10_000 });
  });

  test("accepts service-specific values", () => {
    expect(parseConfig({ PORT: "3100", EMAIL_FROM: "notifications@example.test" })).toMatchObject({
      port: 3100,
      emailFrom: "notifications@example.test",
    });
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ PORT: "70000" })).toThrow("PORT");
    expect(() => parseConfig({ SHUTDOWN_TIMEOUT_MS: "0" })).toThrow("SHUTDOWN_TIMEOUT_MS");
  });
});
