import { describe, expect, test } from "bun:test";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { InMemoryMemoryBackend } from "./memory.backend.ts";
import { MemoryService } from "./memory.service.ts";

function buildGraph(service: MemoryService) {
  return new StateGraph(MessagesAnnotation)
    .addNode("respond", () => ({ messages: [new AIMessage("ack")] }))
    .addEdge("__start__", "respond")
    .addEdge("respond", "__end__")
    .compile({ checkpointer: service.getCheckpointer() });
}

describe("InMemoryMemoryBackend", () => {
  test("persists one thread and keeps a new thread empty", async () => {
    const service = new MemoryService(new InMemoryMemoryBackend());
    await service.initialize();
    const graph = buildGraph(service);
    const first = service.createThreadConfig({ userId: "u1", threadId: "t1", agentId: "a1" });
    const second = service.createThreadConfig({ userId: "u1", threadId: "t2", agentId: "a1" });

    await graph.invoke({ messages: [new HumanMessage("hello")] }, first);
    await graph.invoke({ messages: [new HumanMessage("again")] }, first);

    const firstState = await graph.getState(first);
    expect(firstState.values.messages.map((message) => message.content)).toEqual([
      "hello",
      "ack",
      "again",
      "ack",
    ]);

    const secondState = await graph.getState(second);
    expect(secondState.values.messages ?? []).toEqual([]);
  });
});
