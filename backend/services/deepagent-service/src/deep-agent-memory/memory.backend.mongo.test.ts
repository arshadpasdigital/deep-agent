import { describe, expect, test } from "bun:test";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { MongoClient } from "mongodb";
import { MongoMemoryBackend } from "./memory.backend.ts";
import { MemoryService } from "./memory.service.ts";

const mongoUri = process.env.TEST_MONGODB_URI;
const describeMongo = mongoUri ? describe : describe.skip;

function buildGraph(service: MemoryService) {
  return new StateGraph(MessagesAnnotation)
    .addNode("respond", () => ({ messages: [new AIMessage("ack")] }))
    .addEdge("__start__", "respond")
    .addEdge("respond", "__end__")
    .compile({ checkpointer: service.getCheckpointer() });
}

describeMongo("MongoMemoryBackend restart", () => {
  test("restores a thread after the backend is recreated", async () => {
    const suffix = crypto.randomUUID().replaceAll("-", "");
    const checkpointDb = `test_restart_checkpoints_${suffix}`;
    const storeDb = `test_restart_memory_${suffix}`;
    const configIdentity = { userId: "u1", threadId: "t1", agentId: "a1" };

    try {
      const first = new MemoryService(
        new MongoMemoryBackend({ uri: mongoUri!, checkpointDb, storeDb }),
      );
      await first.initialize();
      await buildGraph(first).invoke(
        { messages: [new HumanMessage("before restart")] },
        first.createThreadConfig(configIdentity),
      );
      await first.close();

      const second = new MemoryService(
        new MongoMemoryBackend({ uri: mongoUri!, checkpointDb, storeDb }),
      );
      await second.initialize();
      const state = await buildGraph(second).getState(second.createThreadConfig(configIdentity));

      expect(state.values.messages.map((message) => message.content)).toEqual([
        "before restart",
        "ack",
      ]);
      await second.close();
    } finally {
      const client = new MongoClient(mongoUri!);
      await client.connect();
      await client.db(checkpointDb).dropDatabase();
      await client.db(storeDb).dropDatabase();
      await client.close();
    }
  });
});
