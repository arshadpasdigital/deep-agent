# Design

## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `src/deep-agent-memory/index.ts` builds an agent with `createAgent` from
  `langchain` but passes no `checkpointer` or `store`, streams `updates`, and
  invokes with `configurable: { threadId, userId }`. LangGraph expects
  `thread_id`.
- `src/deep-agent-memory/prompts/memo-prompt.ts` exports an empty string.
- `deep-agent-memory/pipelines/` and `tools/` exist but are empty.
- The service already depends on `@langchain/core`, `@langchain/langgraph`,
  `langchain`, and has `@langchain/langgraph-checkpoint` available transitively;
  the MongoDB saver/store package is not installed.
- `src/bootstrap/config.ts` is a Zod schema parsed at import time; `NODE_ENV`,
  `PORT`, `GRPC_DEEP_AGENT_PORT`, and optional model credentials exist today.
- Root `backend/docker-compose.yml` already runs MongoDB; the service has no
  Mongo client dependency yet.
- `src/features/agent/*` is placeholder scaffolding, the gRPC server registers
  no services, and `chat.proto`'s `ChatRequest` has no message-content field.
  Agent request plumbing is therefore out of scope for this change.
- Tests use `bun:test`; `tsconfig.json` excludes `*.test.ts` from the build.

## Goals / Non-Goals

**Goals:**

- One memory contract that both the in-memory and MongoDB backends satisfy.
- Thread continuity that survives restarts and interrupted turns when the
  durable backend is configured.
- Namespaced long-term facts with explicit write, update, search, and delete.
- Clear ownership boundaries: `deep-agent-memory` owns memory, the agent feature
  only injects it.
- Testable isolation and failure behavior without requiring MongoDB.

**Non-Goals:**

- mem0.ai or any external memory service.
- Automatic fact extraction or summarization of old turns. Writes are explicit
  (model tool calls or service calls).
- Context-window trimming/compaction. Full thread history is stored; bounding
  what is sent to the model is a separate change.
- gRPC chat handling, model/provider selection, and auth-service Mongo
  persistence.

## Decisions

### Two memory layers, both LangGraph-native

Use a LangGraph `BaseCheckpointSaver` for thread memory and a `BaseStore` for
long-term memory, both injected into `createAgent({ checkpointer, store })`.

- Checkpointer: keyed by `thread_id`, writes state after every superstep, and
  restores it on the next invoke. This supplies continuity, restart recovery,
  and interrupted-turn resume without custom message bookkeeping.
- Store: keyed by an application namespace, independent of threads. Supplies
  cross-thread recall.

Alternatives considered: a single custom messages/facts table written by hand
(reimplements checkpoint versioning, per-step writes, serialization, and
resume); a file-based store (no concurrency, no per-user isolation, ephemeral in
containers, no search); mem0 (adds a vendor, network hop, cost, and data
governance for extraction we are not building yet).

### Layered modules with a singleton service

`deep-agent-memory` is split into three responsibilities:

1. `memory.backend.ts` — `MemoryBackend` interface: `createCheckpointer()` and
   `createStore()`. Adapters:
   - `InMemoryMemoryBackend` → `MemorySaver` + `InMemoryStore`.
   - `MongoMemoryBackend` → `MongoDBSaver` + `MongoDBStore`.
2. `memory.repository.ts` — domain contract over long-term facts
   (`getFact`, `upsertFact`, `deleteFact`, `searchFacts`, `listFacts`) plus
   namespace construction, implemented against a `BaseStore`. This keeps the
   application code from depending on store internals.
3. `memory.service.ts` — a class singleton wiring backend + repository and
   exposing `getCheckpointer()`, `getStore()`, fact operations, and
   `createThreadConfig({ userId, threadId, agentId })`.

`index.ts` (`setupMemoAgent`) consumes the singleton only. This mirrors the
project's controller → service → repository convention and keeps the backend
swap to one factory function.

Alternative considered: adapters injecting a raw `BaseStore` everywhere. It
leaks LangGraph specifics into feature code and makes swapping to a non-LangGraph
backend later harder.

### Namespaces encode tenancy

Long-term memory uses the namespace tuple
`["users", userId, "agents", agentId, "facts"]`, with one key per fact and the
fact value stored as `{ text, updatedAt, source }`. Thread state remains
LangGraph's internal storage keyed by `thread_id`; the application never
addresses checkpoints directly.

Alternative considered: a single global collection with `userId`/`agentId`
fields. It moves isolation into every query (easy to forget) instead of making
it structural.

### Backend selection is explicit configuration

Add to the Zod environment schema:

- `MEMORY_BACKEND`: `"mongo" | "memory"`, default `"mongo"`.
- `MONGODB_URI`: required when `MEMORY_BACKEND=mongo`.
- `MEMORY_CHECKPOINT_DB`: default `deepagent_checkpoints`.
- `MEMORY_STORE_DB`: default `deepagent_memory`.

Production startup MUST reject `MEMORY_BACKEND=memory` so a deployed service
cannot silently lose memory on restart. Tests and local development may select
`memory`.

Alternative considered: infer the backend from whether `MONGODB_URI` is set.
Implicit selection makes a missing URI look like a valid in-memory deployment.

### Identity validation before memory access

`MemoryService` validates non-empty `userId`, `threadId`, and (for long-term
operations) `agentId` before touching a backend, throwing a typed
`MemoryIdentityError`. The agent invocation maps gRPC `threadId` to LangGraph's
`thread_id` in `configurable`; `userId` and `agentId` travel alongside for
namespacing.

Alternative considered: let `undefined` identifiers become empty namespaces.
That would silently merge tenants.

### Explicit fact tools, not automatic extraction

Expose `remember`, `recall`, and `forget` tools backed by `MemoryService` in
`deep-agent-memory/tools/`, and register them on the memo agent. The model
decides what to persist; updates overwrite the fact key.

Alternatives considered: a post-turn summarization node (extra model call and
latency, and it reintroduces the extraction problem mem0 solves); background
extraction (out of scope for this change).

### Failures propagate with operation context

Backend errors are wrapped in a `MemoryError` carrying the operation and tenant
identifiers, then rethrown. The service does not catch and continue, so a failed
checkpoint write fails the turn rather than producing a reply that memory never
recorded.

Alternative considered: degrade to stateless operation. It hides data loss and
makes intermittent failures invisible.

### Tests: shared contract, gated Mongo suite

Write one contract test suite parameterized over both backends, covering
continuity, restart/restore (new backend instance over the same storage),
cross-thread recall, update, delete, cross-user and cross-agent isolation, and
missing-identity rejection. Run the in-memory variant unconditionally; run the
Mongo variant only when a test Mongo URI is provided, so `bun test` stays green
without infrastructure. Tests use `bun:test` and live beside the modules they
cover.

## Risks / Trade-offs

- [Risk] Unbounded thread history grows checkpoints and prompt size → document
  that trimming/compaction is out of scope; add truncation as a follow-up before
  enabling long conversations in production.
- [Risk] Namespace mistakes leak memory across tenants → namespace construction
  lives in one place, and isolation scenarios run against both backends.
- [Risk] `MongoDBSaver`/`MongoDBStore` add a dependency and connection lifecycle
  the service does not currently manage → open the Mongo client once in the
  memory backend, reuse it for saver and store, and close it during graceful
  shutdown; Mongo tests are opt-in.
- [Risk] In-memory default masks a missing Mongo configuration in development →
  log the selected backend at startup and reject `memory` in production.
- [Risk] `chat.proto` lacks message content, so this memory layer cannot be
  exercised end-to-end through gRPC yet → keep the change to the memory
  subsystem and wire request handling in a separate change.
- [Risk] Streamed `updates` currently conflate model and tool chunks → the
  wiring task corrects the invocation and the `tool_calls` check, but response
  shaping for clients remains in the agent-execution change.

## Migration Plan

1. Add the MongoDB checkpoint/store dependency and the new environment fields
   with local defaults.
2. Add `memory.backend.ts`, `memory.repository.ts`, `memory.service.ts`, and the
   fact tools/prompt; keep the in-memory backend the default in tests.
3. Wire `checkpointer` and `store` into `setupMemoAgent`, pass `thread_id`, and
   register the memory tools.
4. Run `bun test` and `bun run build` in the service; opt-in Mongo contract
   tests run where a URI is available.
5. Rollback: stop wiring the memory modules into the agent and remove the new
   env fields/dependency. Checkpoint and memory collections are additive and can
   be dropped; no destructive migration or public API change is involved.

## Open Questions

- Retention: whether thread checkpoints and long-term facts need a TTL or purge
  policy can be decided after the memory layer is in use; it does not change the
  contracts above.
