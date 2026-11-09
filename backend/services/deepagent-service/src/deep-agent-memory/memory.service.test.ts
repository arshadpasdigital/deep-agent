import { describe, expect, test } from "bun:test";
import { InMemoryMemoryBackend } from "./memory.backend.ts";
import { MemoryIdentityError } from "./memory.errors.ts";
import {
  getMemoryService,
  MemoryService,
  resetMemoryService,
} from "./memory.service.ts";

describe("MemoryService", () => {
  test("rejects missing identifiers", async () => {
    const service = new MemoryService(new InMemoryMemoryBackend());

    await expect(
      service.remember({ userId: "", agentId: "a1" }, "key", { text: "value" }),
    ).rejects.toBeInstanceOf(MemoryIdentityError);
    await expect(
      service.remember({ userId: "u1", agentId: "" }, "key", { text: "value" }),
    ).rejects.toBeInstanceOf(MemoryIdentityError);
    await expect(
      service.remember({ userId: "u1", agentId: "a1" }, "", { text: "value" }),
    ).rejects.toBeInstanceOf(MemoryIdentityError);
    expect(() =>
      service.createThreadConfig({ userId: "u1", threadId: "", agentId: "a1" }),
    ).toThrow(MemoryIdentityError);
  });

  test("reuses the same checkpointer and store instances", async () => {
    const service = new MemoryService(new InMemoryMemoryBackend());

    expect(service.getCheckpointer()).toBe(service.getCheckpointer());
    expect(service.getStore()).toBe(service.getStore());
    await service.initialize();
    await expect(service.initialize()).resolves.toBeUndefined();
  });

  test("module singleton is reused and respects the configured backend", () => {
    process.env.NODE_ENV = "testing";
    process.env.GRPC_DEEP_AGENT_PORT = "50052";
    process.env.MEMORY_BACKEND = "memory";
    resetMemoryService();

    const first = getMemoryService();
    expect(getMemoryService()).toBe(first);
    expect(first.getBackendKind()).toBe("memory");
  });
});
