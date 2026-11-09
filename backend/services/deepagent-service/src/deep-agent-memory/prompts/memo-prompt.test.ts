import { describe, expect, test } from "bun:test";
import { MEMORY_BASE_SYSTEM_PROMPT } from "./memo-prompt.ts";

describe("MEMORY_BASE_SYSTEM_PROMPT", () => {
  test("is non-empty and references the memory tools", () => {
    expect(MEMORY_BASE_SYSTEM_PROMPT.trim().length).toBeGreaterThan(50);

    for (const toolName of ["remember", "recall", "forget"]) {
      expect(MEMORY_BASE_SYSTEM_PROMPT).toContain(`"${toolName}"`);
    }
  });
});
