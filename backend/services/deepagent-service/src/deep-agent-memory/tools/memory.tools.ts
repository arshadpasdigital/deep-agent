import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { MemoryService } from "../memory.service.js";

export interface MemoryToolOptions {
  memory: MemoryService;
  userId: string;
  agentId: string;
}

export function createMemoryTools({ memory, userId, agentId }: MemoryToolOptions) {
  const identity = { userId, agentId };

  const remember = tool(
    async ({ key, text, source }) => {
      const fact = await memory.remember(identity, key, { text, source });
      return `Remembered "${fact.key}".`;
    },
    {
      name: "remember",
      description: "Store or update a durable fact or preference for this user.",
      schema: z.object({
        key: z.string().min(1).describe("Stable key for the fact, for example 'preferred-language'."),
        text: z.string().min(1).describe("The fact or preference to remember."),
        source: z.string().optional().describe("Where the fact came from."),
      }),
    },
  );

  const recall = tool(
    async ({ query, limit }) => {
      const facts = await memory.recall(identity, query, limit);
      if (facts.length === 0) return "No stored memories matched.";
      return facts.map((fact) => `${fact.key}: ${fact.text}`).join("\n");
    },
    {
      name: "recall",
      description: "Retrieve durable facts and preferences stored for this user.",
      schema: z.object({
        query: z.string().optional().describe("Text to match against stored facts."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum facts to return."),
      }),
    },
  );

  const forget = tool(
    async ({ key }) => {
      await memory.forget(identity, key);
      return `Forgot "${key}".`;
    },
    {
      name: "forget",
      description: "Delete a previously stored fact for this user.",
      schema: z.object({
        key: z.string().min(1).describe("Key of the fact to delete."),
      }),
    },
  );

  return [remember, recall, forget];
}
