import { describe, expect, test } from "bun:test";
import type { BaseMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { setupMemoAgent } from "./index.ts";
import { InMemoryMemoryBackend } from "./memory.backend.ts";
import { MemoryService } from "./memory.service.ts";

class RecordingChatModel extends FakeListChatModel {
  readonly calls: BaseMessage[][] = [];

  bindTools() {
    return this;
  }

  async _generate(messages: BaseMessage[], options?: any, runManager?: any) {
    this.calls.push([...messages]);
    return super._generate(messages, options, runManager);
  }
}

describe("setupMemoAgent", () => {
  test("a second run in the same thread receives the first turn's messages", async () => {
    const memory = new MemoryService(new InMemoryMemoryBackend());
    const model = new RecordingChatModel({ responses: ["first-reply", "second-reply"] });
    const { memoAgent } = await setupMemoAgent({
      model,
      userId: "u1",
      threadId: "t1",
      agentId: "a1",
      memory,
    });

    const first = await memoAgent("hello");
    const second = await memoAgent("again");

    expect(first.fullContext).toBe("first-reply");
    expect(second.fullContext).toBe("second-reply");
    expect(model.calls).toHaveLength(2);

    const secondTurn = model.calls[1].map((message) => String(message.content));
    expect(secondTurn).toContain("hello");
    expect(secondTurn).toContain("first-reply");
    expect(secondTurn).toContain("again");
  });

  test("a different thread starts without the previous thread's messages", async () => {
    const memory = new MemoryService(new InMemoryMemoryBackend());
    const firstModel = new RecordingChatModel({ responses: ["first-reply"] });
    const firstAgent = await setupMemoAgent({
      model: firstModel,
      userId: "u1",
      threadId: "t1",
      agentId: "a1",
      memory,
    });
    await firstAgent.memoAgent("hello");

    const secondModel = new RecordingChatModel({ responses: ["other-reply"] });
    const secondAgent = await setupMemoAgent({
      model: secondModel,
      userId: "u1",
      threadId: "t2",
      agentId: "a1",
      memory,
    });
    await secondAgent.memoAgent("different thread");

    const secondTurn = secondModel.calls[0].map((message) => String(message.content));
    expect(secondTurn).toContain("different thread");
    expect(secondTurn).not.toContain("hello");
    expect(secondTurn).not.toContain("first-reply");
  });
});
