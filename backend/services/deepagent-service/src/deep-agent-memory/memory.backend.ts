import type { BaseCheckpointSaver, BaseStore } from "@langchain/langgraph-checkpoint";
import { InMemoryStore, MemorySaver } from "@langchain/langgraph-checkpoint";
import { MongoClient } from "mongodb";
import { MongoDBSaver, MongoDBStore } from "@langchain/langgraph-checkpoint-mongodb";
import { MemoryError } from "./memory.errors.js";

export type MemoryBackendConfig =
  | { kind: "memory" }
  | {
      kind: "mongo";
      uri: string;
      checkpointDb: string;
      storeDb: string;
    };

export interface MemoryBackend {
  readonly kind: MemoryBackendConfig["kind"];
  createCheckpointer(): BaseCheckpointSaver;
  createStore(): BaseStore;
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export class InMemoryMemoryBackend implements MemoryBackend {
  readonly kind = "memory" as const;
  private readonly checkpointer = new MemorySaver();
  private readonly store = new InMemoryStore();

  createCheckpointer() {
    return this.checkpointer;
  }

  createStore() {
    return this.store;
  }

  async initialize() {}

  async close() {}
}

export class MongoMemoryBackend implements MemoryBackend {
  readonly kind = "mongo" as const;
  private readonly client: MongoClient;
  private readonly checkpointer: MongoDBSaver;
  private readonly store: MongoDBStore;

  constructor({ uri, checkpointDb, storeDb }: {
    uri: string;
    checkpointDb: string;
    storeDb: string;
  }) {
    this.client = new MongoClient(uri);
    this.checkpointer = new MongoDBSaver({ client: this.client, dbName: checkpointDb });
    this.store = new MongoDBStore({ client: this.client, dbName: storeDb });
  }

  createCheckpointer() {
    return this.checkpointer;
  }

  createStore() {
    return this.store;
  }

  async initialize() {
    try {
      await this.client.connect();
      const errors = await this.checkpointer.setup();
      if (errors.length > 0) {
        throw new MemoryError(
          `MongoDB checkpoint setup failed: ${errors.map((error) => error.message).join("; ")}`,
          "initialize",
        );
      }
      await this.store.start();
    } catch (error) {
      if (error instanceof MemoryError) throw error;
      throw new MemoryError("MongoDB memory backend initialization failed", "initialize", error);
    }
  }

  async close() {
    await this.client.close();
  }
}

export function createMemoryBackend(config: MemoryBackendConfig): MemoryBackend {
  if (config.kind === "memory") return new InMemoryMemoryBackend();
  return new MongoMemoryBackend({
    uri: config.uri,
    checkpointDb: config.checkpointDb,
    storeDb: config.storeDb,
  });
}
