import { describe, expect, test } from "bun:test";
import { parseConfig } from "./config.ts";

const base = {
  NODE_ENV: "development",
  GRPC_DEEP_AGENT_PORT: "50052",
};

describe("DeepAgent Service environment", () => {
  test("uses defaults while model credentials remain optional", () => {
    expect(parseConfig({ ...base, MEMORY_BACKEND: "memory" })).toMatchObject({
      PORT: 3002,
      SHUTDOWN_TIMEOUT_MS: 10_000,
      MEMORY_CHECKPOINT_DB: "deepagent_checkpoints",
      MEMORY_STORE_DB: "deepagent_memory",
    });
  });

  test("accepts service-specific values", () => {
    expect(
      parseConfig({
        ...base,
        PORT: "3200",
        MODEL_PROVIDER: "example",
        MEMORY_BACKEND: "mongo",
        MONGODB_URI: "mongodb://localhost:27017/deep-agent",
      }),
    ).toMatchObject({
      PORT: 3200,
      MODEL_PROVIDER: "example",
      MEMORY_BACKEND: "mongo",
      MONGODB_URI: "mongodb://localhost:27017/deep-agent",
    });
  });

  test("requires MONGODB_URI when the mongo backend is selected", () => {
    expect(() => parseConfig(base)).toThrow("MONGODB_URI");
    expect(() => parseConfig({ ...base, MEMORY_BACKEND: "mongo" })).toThrow("MONGODB_URI");
  });

  test("rejects the in-memory backend in production", () => {
    expect(() =>
      parseConfig({ ...base, NODE_ENV: "production", MEMORY_BACKEND: "memory" }),
    ).toThrow("MEMORY_BACKEND");
  });

  test("accepts the mongo backend in production with a URI", () => {
    expect(
      parseConfig({
        ...base,
        NODE_ENV: "production",
        MEMORY_BACKEND: "mongo",
        MONGODB_URI: "mongodb://localhost:27017/deep-agent",
      }),
    ).toMatchObject({ NODE_ENV: "production", MEMORY_BACKEND: "mongo" });
  });

  test("reports invalid variables by name", () => {
    expect(() => parseConfig({ ...base, PORT: "70000" })).toThrow("PORT");
    expect(() => parseConfig({ ...base, SHUTDOWN_TIMEOUT_MS: "0" })).toThrow("SHUTDOWN_TIMEOUT_MS");
  });
});
