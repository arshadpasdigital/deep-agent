# Deep agent memory

The memory layer gives the memo agent two kinds of memory:

- **Thread memory** (short-term): a LangGraph checkpointer keyed by `thread_id`.
  Graph state is written after every superstep, so a conversation resumes across
  turns, process restarts, and interrupted or tool-calling runs.
- **Long-term memory**: a LangGraph `BaseStore` namespaced by user and agent.
  Facts survive across threads and are written explicitly through the
  `remember`, `recall`, and `forget` tools.

## Modules

- `memory.backend.ts` — `MemoryBackend` contract plus the in-memory and MongoDB
  adapters. `createMemoryBackend()` selects one from configuration.
- `memory.repository.ts` — fact operations over a `BaseStore`, including the
  namespace builder.
- `memory.service.ts` — the singleton service used by the rest of the service.
  It validates identities and exposes `getCheckpointer()`, `getStore()`,
  `createThreadConfig()`, `remember()`, `recall()`, and `forget()`.
- `tools/memory.tools.ts` — the model-facing memory tools, bound to one user and
  agent when the agent is created.
- `index.ts` — `setupMemoAgent()`, which wires the checkpointer, store, tools, and
  system prompt into `createAgent`.

## Backend selection

Configured through the service environment (`src/bootstrap/config.ts`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `MEMORY_BACKEND` | `mongo` | `mongo` (durable) or `memory` (process-only) |
| `MONGODB_URI` | — | Required when `MEMORY_BACKEND=mongo` |
| `MEMORY_CHECKPOINT_DB` | `deepagent_checkpoints` | Checkpoint database |
| `MEMORY_STORE_DB` | `deepagent_memory` | Long-term memory database |

`MEMORY_BACKEND=memory` is rejected when `NODE_ENV=production`; use it only for
tests and local development.

The startup log reports the selected backend:

```
deepagent-service listening on port 3002 (memory backend: mongo)
```

## Namespaces and identity

Long-term facts use the namespace tuple:

```
["users", userId, "agents", agentId, "facts"]
```

Thread state is stored by the checkpointer under LangGraph's internal
`thread_id` key. `MemoryService.createThreadConfig()` maps the application's
`threadId` to LangGraph's `thread_id` and passes `user_id`/`agent_id` alongside.
Every memory operation requires non-empty identifiers and throws
`MemoryIdentityError` otherwise, so memory is never read or written unscoped.

The MongoDB adapter creates `checkpoints`, `checkpoint_writes`, and `store`
collections in the configured databases.

## Tests

Run the in-memory suite (Mongo tests skip automatically):

```sh
bun test
```

Run the MongoDB contract and restart tests against a local MongoDB:

```sh
TEST_MONGODB_URI=mongodb://127.0.0.1:27017 bun test src/deep-agent-memory
```

The MongoDB suite creates uniquely named databases and drops them when done.
