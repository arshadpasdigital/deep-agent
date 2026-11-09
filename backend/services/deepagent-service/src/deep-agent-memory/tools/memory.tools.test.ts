import { describe, expect, test } from "bun:test";
import { InMemoryMemoryBackend } from "../memory.backend.ts";
import { MemoryService } from "../memory.service.ts";
import { createMemoryTools } from "./memory.tools.ts";

describe("memory tools", () => {
  test("remember, recall, and forget operate on the calling user", async () => {
    const memory = new MemoryService(new InMemoryMemoryBackend());
    const [remember, recall, forget] = createMemoryTools({
      memory,
      userId: "u1",
      agentId: "a1",
    });

    expect(
      await remember.invoke({ key: "language", text: "TypeScript", source: "user" }),
    ).toBe('Remembered "language".');
    expect(await recall.invoke({ query: "type" })).toContain("language: TypeScript");
    expect(await forget.invoke({ key: "language" })).toBe('Forgot "language".');
    expect(await recall.invoke({})).toBe("No stored memories matched.");
  });

  test("never returns another user's facts", async () => {
    const memory = new MemoryService(new InMemoryMemoryBackend());
    const alice = createMemoryTools({ memory, userId: "alice", agentId: "a1" });
    const bob = createMemoryTools({ memory, userId: "bob", agentId: "a1" });

    await alice[0].invoke({ key: "secret", text: "alpha" });

    expect(await bob[1].invoke({})).toBe("No stored memories matched.");
    expect(await alice[1].invoke({})).toContain("secret: alpha");
  });
});
