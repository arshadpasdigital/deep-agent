import type { RunnableConfig } from "@langchain/core/runnables";
import { getEnv, type EnvType } from "@/bootstrap/config.js";
import { createMemoryBackend, type MemoryBackend } from "./memory.backend.js";
import { MemoryError, MemoryIdentityError, type MemoryOperation } from "./memory.errors.js";
import {
  MemoryRepository,
  type MemoryFact,
  type MemoryFactInput,
} from "./memory.repository.js";

export interface MemoryIdentity {
  userId: string;
  agentId: string;
}

export interface ThreadIdentity extends MemoryIdentity {
  threadId: string;
}

function requireIdentifier(value: string | undefined, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new MemoryIdentityError(field);
  }
  return value;
}

export class MemoryService {
  private readonly repository: MemoryRepository;
  private initialization?: Promise<void>;

  constructor(private readonly backend: MemoryBackend) {
    this.repository = new MemoryRepository(backend.createStore());
  }

  getBackendKind() {
    return this.backend.kind;
  }

  initialize(): Promise<void> {
    this.initialization ??= this.backend.initialize();
    return this.initialization;
  }

  getCheckpointer() {
    return this.backend.createCheckpointer();
  }

  getStore() {
    return this.backend.createStore();
  }

  createThreadConfig({ userId, threadId, agentId }: ThreadIdentity): RunnableConfig {
    return {
      configurable: {
        thread_id: requireIdentifier(threadId, "threadId"),
        user_id: requireIdentifier(userId, "userId"),
        agent_id: requireIdentifier(agentId, "agentId"),
      },
    };
  }

  async remember(
    identity: MemoryIdentity,
    key: string,
    fact: MemoryFactInput,
  ): Promise<MemoryFact> {
    const scoped = this.scope(identity);
    const factKey = requireIdentifier(key, "key");
    return this.run("upsert", () =>
      this.repository.upsertFact(scoped.userId, scoped.agentId, factKey, fact),
    );
  }

  async recall(
    identity: MemoryIdentity,
    query?: string,
    limit?: number,
  ): Promise<MemoryFact[]> {
    const scoped = this.scope(identity);
    return this.run("search", () =>
      this.repository.searchFacts(scoped.userId, scoped.agentId, query, limit),
    );
  }

  async forget(identity: MemoryIdentity, key: string): Promise<void> {
    const scoped = this.scope(identity);
    const factKey = requireIdentifier(key, "key");
    await this.run("delete", () =>
      this.repository.deleteFact(scoped.userId, scoped.agentId, factKey),
    );
  }

  async close(): Promise<void> {
    await this.run("close", () => this.backend.close());
  }

  private scope(identity: MemoryIdentity): MemoryIdentity {
    return {
      userId: requireIdentifier(identity?.userId, "userId"),
      agentId: requireIdentifier(identity?.agentId, "agentId"),
    };
  }

  private async run<T>(operation: MemoryOperation, action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof MemoryError) throw error;
      throw new MemoryError(`Memory ${operation} failed`, operation, error);
    }
  }
}

export function createMemoryBackendFromEnv(env: EnvType): MemoryBackend {
  if (env.MEMORY_BACKEND === "memory") {
    return createMemoryBackend({ kind: "memory" });
  }
  return createMemoryBackend({
    kind: "mongo",
    uri: env.MONGODB_URI!,
    checkpointDb: env.MEMORY_CHECKPOINT_DB,
    storeDb: env.MEMORY_STORE_DB,
  });
}

let singleton: MemoryService | undefined;

export function getMemoryService(): MemoryService {
  singleton ??= new MemoryService(createMemoryBackendFromEnv(getEnv()));
  return singleton;
}

export function resetMemoryService(): void {
  singleton = undefined;
}
