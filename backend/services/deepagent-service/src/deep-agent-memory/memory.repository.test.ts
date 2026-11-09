import { describe, expect, test } from "bun:test";
import { InMemoryStore } from "@langchain/langgraph-checkpoint";
import { MemoryRepository } from "./memory.repository.ts";

describe("MemoryRepository", () => {
  test("stores, updates, lists, searches, and deletes facts", async () => {
    const repository = new MemoryRepository(new InMemoryStore());

    await repository.upsertFact("u1", "a1", "language", { text: "JavaScript" });
    expect(await repository.getFact("u1", "a1", "language")).toMatchObject({
      key: "language",
      text: "JavaScript",
    });

    await repository.upsertFact("u1", "a1", "language", {
      text: "TypeScript",
      source: "user",
    });
    expect(await repository.getFact("u1", "a1", "language")).toMatchObject({
      text: "TypeScript",
      source: "user",
    });

    await repository.upsertFact("u1", "a1", "editor", { text: "Neovim" });
    expect((await repository.listFacts("u1", "a1")).map((fact) => fact.key).sort()).toEqual([
      "editor",
      "language",
    ]);
    expect((await repository.searchFacts("u1", "a1", "type")).map((fact) => fact.key)).toEqual([
      "language",
    ]);

    await repository.deleteFact("u1", "a1", "language");
    expect(await repository.getFact("u1", "a1", "language")).toBeNull();
  });

  test("scopes facts by user and agent", async () => {
    const repository = new MemoryRepository(new InMemoryStore());
    await repository.upsertFact("u1", "a1", "secret", { text: "alpha" });

    expect(await repository.getFact("u2", "a1", "secret")).toBeNull();
    expect(await repository.getFact("u1", "a2", "secret")).toBeNull();
    expect(await repository.listFacts("u2", "a1")).toEqual([]);
  });
});
