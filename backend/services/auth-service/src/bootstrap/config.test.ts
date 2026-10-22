import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

describe("Auth Service environment", () => {
  test("uses the port and shutdown defaults with a MongoDB URI", () => {
    expect(parseConfig({ MONGODB_URI: "mongodb://localhost:27017/deep_agent" })).toMatchObject({
      port: 3000,
      shutdownTimeoutMs: 10_000,
      mongodbUri: "mongodb://localhost:27017/deep_agent",
    });
  });

  test("reports a missing MongoDB URI by name", () => {
    expect(() => parseConfig({})).toThrow("MONGODB_URI");
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ MONGODB_URI: "http://mongo:27017", PORT: "invalid" })).toThrow("PORT");
    expect(() => parseConfig({ MONGODB_URI: "not-a-mongodb-url" })).toThrow("MONGODB_URI");
  });
});
