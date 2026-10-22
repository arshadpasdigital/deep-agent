import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

describe("DeepAgent Service environment", () => {
  test("uses defaults while model credentials remain optional", () => {
    expect(parseConfig({})).toMatchObject({ port: 3000, shutdownTimeoutMs: 10_000 });
  });

  test("accepts service-specific values", () => {
    expect(parseConfig({ PORT: "3200", MODEL_PROVIDER: "example" })).toMatchObject({
      port: 3200,
      modelProvider: "example",
    });
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ PORT: "70000" })).toThrow("PORT");
    expect(() => parseConfig({ SHUTDOWN_TIMEOUT_MS: "0" })).toThrow("SHUTDOWN_TIMEOUT_MS");
  });
});
