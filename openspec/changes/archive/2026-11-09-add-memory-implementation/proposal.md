# Proposal

## Why

The `deepagent-service` has a `deep-agent-memory` scaffold but no working memory:
`createAgent` is called without a `checkpointer` or `store`, the memo system prompt
is empty, and the agent is invoked with `threadId` instead of LangGraph's expected
`thread_id`, so no conversation state is ever persisted or restored. A naive
file-based store cannot satisfy the tenant model already expressed by the gRPC
contract (`userId`, `threadId`, `agentId`): concurrent users, per-user isolation,
cross-thread recall, and container restarts would all break. The service already
depends on LangChain/LangGraph and the backend already runs MongoDB, so the
project should adopt LangGraph's native memory rather than an external memory
vendor.

## What Changes

- Add a memory subsystem under `src/deep-agent-memory/` that provides two
  distinct kinds of memory:
  - **Thread memory** (short-term): LangGraph checkpointer keyed by `thread_id`,
    persisting graph state after every superstep so a conversation resumes
    across turns, restarts, and interrupted/tool-calling runs.
  - **Long-term memory**: a LangGraph `BaseStore` namespaced by `userId` and
    `agentId`, holding facts/preferences that survive across threads.
- Define a provider-agnostic `MemoryRepository` interface plus
  `MemoryService` (layered controller → service → repository style) so the
  memory backend is swappable.
- Ship two adapters: an in-memory adapter for tests/local development
  (`MemorySaver` + `InMemoryStore`) and a MongoDB adapter for production
  (`MongoDBSaver` + `MongoDBStore`) using the MongoDB instance already present in
  Compose. File-based memory is explicitly **not** adopted as a production path.
- Wire `checkpointer` and `store` into the memo agent, correct the invocation to
  pass `thread_id`, and replace the empty system prompt with memory instructions.
- Add an explicit long-term-write path (tool/node) that records, updates, and
  searches user/agent facts in a namespaced store.
- Add environment configuration for the Mongo connection and checkpoint/store
  database names, with validation at startup.
- Add unit tests for repository isolation, thread continuity, long-term recall,
  and adapter parity.

Out of scope: mem0.ai or any external memory SaaS, the gRPC chat handler that
would invoke the agent, model/provider selection, and schema migrations for
existing services. (Note: `backend/packages/proto/chat.proto` currently has no
message-content field; covering request handling is a separate change.)

## Capabilities

### New Capabilities

- `agent-memory`: Thread-scoped conversation memory and user/agent-scoped
  long-term memory for the deep agent, including isolation guarantees,
  persistence, retrieval, and lifecycle behavior.

### Modified Capabilities

None. No existing capability specs are defined in this project.

## Impact

- **Code**: `backend/services/deepagent-service/src/deep-agent-memory/**`
  (`index.ts`, new `memory.repository.ts`, `memory.service.ts`, adapters,
  `prompts/memo-prompt.ts`), plus agent-feature wiring in
  `src/features/agent/`.
- **Dependencies** (service-local `package.json`/`bun.lock`):
  `@langchain/langgraph-checkpoint` (already transitively present) and
  `@langchain/langgraph-checkpoint-mongodb`.
- **Configuration**: new `MONGODB_URI`, `MEMORY_CHECKPOINT_DB`,
  `MEMORY_STORE_DB` (or equivalent) in `src/bootstrap/config.ts` and
  `.env.example`; defaults must keep local `bun run dev` working.
- **Infrastructure**: reuses the existing MongoDB service in
  `backend/docker-compose.yml`; no new external service, no public API change.
- **Data**: new MongoDB collections for checkpoints/writes and long-term memory,
  namespaced by user and agent; per-user data isolation is a correctness
  requirement.
- **Risk**: memory persistence is stateful and per-user; leaks across namespaces
  or threads would be a privacy defect, so isolation must be tested explicitly.
