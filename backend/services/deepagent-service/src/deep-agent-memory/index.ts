import { createAgent } from "langchain";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { MEMORY_BASE_SYSTEM_PROMPT } from "./prompts/memo-prompt.js";
import { getMemoryService, type MemoryService } from "./memory.service.js";
import { createMemoryTools } from "./tools/memory.tools.js";

export type SetupMemoAgentType = {
  model: any;
  userId: string;
  threadId: string;
  agentId: string;
  memory?: MemoryService;
};

export async function setupMemoAgent({
  model,
  userId,
  threadId,
  agentId,
  memory = getMemoryService(),
}: SetupMemoAgentType) {
  await memory.initialize();
  const threadConfig = memory.createThreadConfig({ userId, threadId, agentId });
  const tools = createMemoryTools({ memory, userId, agentId });

  const agent = createAgent({
    model,
    tools,
    systemPrompt: MEMORY_BASE_SYSTEM_PROMPT,
    checkpointer: memory.getCheckpointer(),
    store: memory.getStore(),
  });

  async function memoAgent(userInput: string, config: LangGraphRunnableConfig = {}) {
    let fullContext = "";

    for await (const chunk of await agent.stream(
      { messages: [{ role: "user", content: userInput }] },
      {
        ...config,
        streamMode: "updates",
        configurable: {
          ...threadConfig.configurable,
          ...config?.configurable,
        },
      },
    )) {
      const messages = (chunk as any)?.model_request?.messages ?? [];

      for (const message of messages) {
        if (message?.tool_calls?.length) continue;

        const content = typeof message?.content === "string" ? message.content : "";
        if (!content) continue;

        fullContext += content;
        config?.writer?.({ manager_name: "memoryManager", content });
      }
    }

    return { fullContext };
  }

  return {
    memoAgent,
  };
}
