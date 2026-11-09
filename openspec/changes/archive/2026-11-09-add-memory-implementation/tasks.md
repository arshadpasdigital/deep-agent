# Tasks

## 1. Dependencies and configuration

- [x] 1.1 Add `@langchain/langgraph-checkpoint-mongodb` to
  `backend/services/deepagent-service/package.json` and install with Bun; verify
  the Mongo saver/store imports resolve with `bun -e 'import("@langchain/langgraph-checkpoint-mongodb")'`.
- [x] 1.2 Extend the Zod schema in `src/bootstrap/config.ts` with
  `MEMORY_BACKEND` (`mongo` default), conditional `MONGODB_URI`,
  `MEMORY_CHECKPOINT_DB`, and `MEMORY_STORE_DB`; verify `src/bootstrap/config.test.ts`
  covers valid combinations and that production rejects `MEMORY_BACKEND=memory`
  via `bun test src/bootstrap/config.test.ts`.
- [x] 1.3 Document the new memory variables in
  `backend/services/deepagent-service/.env.example` with local-safe defaults;
  verify every variable in the schema appears there and `bun run build` passes.

## 2. Memory contract and in-memory backend

- [x] 2.1 Define `MemoryBackend` in `src/deep-agent-memory/memory.backend.ts`
  with `createCheckpointer()`, `createStore()`, and `close()`; verify the module
  type-checks via `bun run build`.
- [x] 2.2 Implement `InMemoryMemoryBackend` using `MemorySaver` and
  `InMemoryStore`; verify a unit test appends messages in one thread and reads
  them back from a second agent run, and that a new thread stays empty.
- [x] 2.3 Implement `src/deep-agent-memory/memory.repository.ts` over
  `BaseStore` with the namespace
  `["users", userId, "agents", agentId, "facts"]` and `getFact`, `upsertFact`,
  `deleteFact`, `searchFacts`, `listFacts`; verify CRUD, update-overwrites, and
  delete tests pass.
- [x] 2.4 Implement `MemoryService` in `src/deep-agent-memory/memory.service.ts`
  as a singleton that selects the backend from config, validates non-empty
  `userId`/`threadId`/`agentId`, and exposes `getCheckpointer()`, `getStore()`,
  fact operations, and `createThreadConfig({ userId, threadId, agentId })`; verify
  missing-identifier tests throw `MemoryIdentityError` and repeated calls reuse
  one backend instance.
- [x] 2.5 Add a shared contract test suite in
  `src/deep-agent-memory/memory.contract.test.ts` parameterized by backend,
  covering continuity, new-thread isolation, cross-thread recall, update, delete,
  cross-user isolation, and cross-agent isolation; verify it passes against
  `InMemoryMemoryBackend` with `bun test src/deep-agent-memory/memory.contract.test.ts`.

## 3. MongoDB backend

- [x] 3.1 Implement `MongoMemoryBackend` using `MongoDBSaver` and
  `MongoDBStore` over one shared Mongo client, with database names from config;
  verify the contract suite passes against it when `TEST_MONGODB_URI` is set and
  is skipped cleanly otherwise.
- [x] 3.2 Add a restart-restore test for Mongo: write a thread, dispose the
  backend, construct a new one against the same database, and verify the
  conversation is restored.
- [x] 3.3 Close the memory backend during graceful shutdown and when the
  service stops in `src/main.ts`; verify the shutdown test observes the close
  call and no handles keep the process alive.

## 4. Agent wiring, tools, and prompt

- [x] 4.1 Correct `setupMemoAgent` in
  `src/deep-agent-memory/index.ts` to pass `checkpointer` and `store`, invoke with
  `configurable: { thread_id }`, and test `tool_calls?.length` instead of the
  nonexistent `tool_calls.request`; verify a test using a fake chat model shows
  the second run in the same thread receiving the first turn's messages.
- [x] 4.2 Implement `remember`, `recall`, and `forget` tools in
  `src/deep-agent-memory/tools/` backed by `MemoryService`; verify each tool
  writes, retrieves, and deletes a fact for the calling `userId`/`agentId` and
  never sees another user's facts.
- [x] 4.3 Replace the empty `MEMORY_BASE_SYSTEM_PROMPT` in
  `src/deep-agent-memory/prompts/memo-prompt.ts` with instructions describing
  when to store, update, recall, and forget long-term facts; verify a test asserts
  the prompt is non-empty and references the memory tools.
- [x] 4.4 Register the memory tools and prompt on the memo agent and confirm the
  module still type-checks with `bun run build`.
- [x] 4.5 Document the memory layer (backend selection, namespaces, thread
  semantics, and test commands) in `src/deep-agent-memory/README.md`; verify the
  documented test commands run as written.

## 5. Integration verification

- [x] 5.1 Run the full service suite with no MongoDB available
  (`bun test`) and confirm it passes with the Mongo contract tests skipped.
- [x] 5.2 Run the opt-in Mongo contract suite against the MongoDB from
  `backend/docker-compose.yml` and confirm checkpoint and long-term memory
  collections are created and isolated per user.
- [x] 5.3 Run `bun run build` and `bun run dev`, confirm startup logs the
  selected memory backend, and confirm the new environment validation fails fast
  with a clear message when `MONGODB_URI` is missing for `MEMORY_BACKEND=mongo`.
