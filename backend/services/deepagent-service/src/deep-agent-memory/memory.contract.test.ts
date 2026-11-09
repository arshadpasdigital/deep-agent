import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { MongoClient } from "mongodb";
import { InMemoryMemoryBackend, MongoMemoryBackend } from "./memory.backend.ts";
import { MemoryIdentityError } from "./memory.errors.ts";
import { MemoryService } from "./memory.service.ts";

interface ContractContext {
  service: MemoryService;
  dispose: () => Promise<void>;
}

type ContractFactory = () => Promise<ContractContext>;

function buildGraph(service: MemoryService) {
  return new StateGraph(MessagesAnnotation)
    .addNode("respond", () => ({ messages: [new AIMessage("ack")] }))
    .addEdge("__start__", "respond")
    .addEdge("respond", "__end__")
    .compile({ checkpointer: service.getCheckpointer() });
}

function defineMemoryContract(label: string, create: ContractFactory) {
  describe(label, () => {
    let service: MemoryService;
    let dispose: () => Promise<void>;

    beforeEach(async () => {
      const context = await create();
      service = context.service;
      dispose = context.dispose;
    });

    afterEach(async () => {
      await dispose();
    });

    test("continues a thread and keeps separate threads empty", async () => {
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

    test("recalls long-term facts across threads", async () => {
      const identity = { userId: "u1", agentId: "a1" };
      await service.remember(identity, "language", { text: "TypeScript", source: "user" });

      const facts = await service.recall(identity, "typescript");
      expect(facts).toHaveLength(1);
      expect(facts[0]).toMatchObject({
        key: "language",
        text: "TypeScript",
        source: "user",
      });
    });

    test("updates and deletes stored facts", async () => {
      const identity = { userId: "u1", agentId: "a1" };

      await service.remember(identity, "color", { text: "blue" });
      await service.remember(identity, "color", { text: "green" });
      expect((await service.recall(identity, "color"))[0]).toMatchObject({ text: "green" });

      await service.forget(identity, "color");
      expect(await service.recall(identity, "color")).toEqual([]);
    });

    test("isolates users and agents", async () => {
      await service.remember({ userId: "u1", agentId: "a1" }, "secret", { text: "alpha" });

      expect(await service.recall({ userId: "u2", agentId: "a1" })).toEqual([]);
      expect(await service.recall({ userId: "u1", agentId: "a2" })).toEqual([]);
      expect(await service.recall({ userId: "u1", agentId: "a1" })).toHaveLength(1);
    });

    test("rejects memory operations without identity", async () => {
      await expect(
        service.remember({ userId: "", agentId: "a1" }, "key", { text: "value" }),
      ).rejects.toBeInstanceOf(MemoryIdentityError);
      await expect(
        service.recall({ userId: "u1", agentId: " " }),
      ).rejects.toBeInstanceOf(MemoryIdentityError);
      expect(() =>
        service.createThreadConfig({ userId: "u1", threadId: "", agentId: "a1" }),
      ).toThrow(MemoryIdentityError);
    });
  });
}

defineMemoryContract("memory contract: in-memory backend", async () => {
  const service = new MemoryService(new InMemoryMemoryBackend());
  await service.initialize();
  return { service, dispose: () => service.close() };
});

const mongoUri = process.env.TEST_MONGODB_URI;

if (mongoUri) {
  defineMemoryContract("memory contract: mongodb backend", async () => {
    const suffix = crypto.randomUUID().replaceAll("-", "");
    const checkpointDb = `test_checkpoints_${suffix}`;
    const storeDb = `test_memory_${suffix}`;
    const service = new MemoryService(
      new MongoMemoryBackend({ uri: mongoUri, checkpointDb, storeDb }),
    );
    await service.initialize();

    return {
      service,
      dispose: async () => {
        await service.close();
        const client = new MongoClient(mongoUri);
        await client.connect();
        await client.db(checkpointDb).dropDatabase();
        await client.db(storeDb).dropDatabase();
        await client.close();
      },
    };
  });
}
