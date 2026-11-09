import type { BaseStore, Item } from "@langchain/langgraph-checkpoint";

export interface MemoryFact {
  key: string;
  text: string;
  source?: string;
  updatedAt: string;
}

export type MemoryFactInput = Omit<MemoryFact, "key" | "updatedAt">;

export function factNamespace(userId: string, agentId: string): string[] {
  return ["users", userId, "agents", agentId, "facts"];
}

export class MemoryRepository {
  constructor(private readonly store: BaseStore) {}

  async getFact(userId: string, agentId: string, key: string): Promise<MemoryFact | null> {
    const item = await this.store.get(factNamespace(userId, agentId), key);
    return item ? this.toFact(item) : null;
  }

  async upsertFact(
    userId: string,
    agentId: string,
    key: string,
    fact: MemoryFactInput,
  ): Promise<MemoryFact> {
    const updatedAt = new Date().toISOString();
    await this.store.put(factNamespace(userId, agentId), key, {
      text: fact.text,
      ...(fact.source === undefined ? {} : { source: fact.source }),
      updatedAt,
    });
    return { key, text: fact.text, source: fact.source, updatedAt };
  }

  async deleteFact(userId: string, agentId: string, key: string): Promise<void> {
    await this.store.delete(factNamespace(userId, agentId), key);
  }

  async searchFacts(
    userId: string,
    agentId: string,
    query?: string,
    limit = 50,
  ): Promise<MemoryFact[]> {
    const items = await this.store.search(factNamespace(userId, agentId), { limit });
    const facts = items.map((item) => this.toFact(item));
    if (!query) return facts;

    const needle = query.toLowerCase();
    return facts.filter(
      (fact) =>
        fact.text.toLowerCase().includes(needle) || fact.key.toLowerCase().includes(needle),
    );
  }

  async listFacts(userId: string, agentId: string, limit = 50): Promise<MemoryFact[]> {
    return this.searchFacts(userId, agentId, undefined, limit);
  }

  private toFact(item: Item): MemoryFact {
    return {
      key: item.key,
      text: String(item.value.text ?? ""),
      source: typeof item.value.source === "string" ? item.value.source : undefined,
      updatedAt: String(item.value.updatedAt ?? ""),
    };
  }
}
