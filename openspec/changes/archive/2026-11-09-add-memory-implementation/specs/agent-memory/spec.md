# Spec Delta

## Purpose

Give the deep agent durable, isolated memory: conversation history that persists
per thread, and long-term facts that persist per user and agent across threads.

## ADDED Requirements

### Requirement: Thread-scoped conversation memory

The system SHALL persist and restore the full conversation state for each
`thread_id`, so that every turn in a thread sees all prior messages in that
thread. A previously unseen `thread_id` MUST start with empty conversation
history.

#### Scenario: Continuing a thread

- **WHEN** a user sends a second message with the same `thread_id`
- **THEN** the agent receives the earlier messages of that thread as context
  before generating a response

#### Scenario: Starting a new thread

- **WHEN** a user sends a message with a `thread_id` that has no stored state
- **THEN** the agent starts with empty conversation history for that thread

#### Scenario: Separate threads do not share history

- **WHEN** the same user sends messages in two different `thread_id` values
- **THEN** neither thread includes the other thread's messages as conversation
  history

### Requirement: Durable conversation state

The system MUST persist conversation state so an in-progress or completed turn
can be restored after a process restart or an interrupted execution when a
persistent backend is configured.

#### Scenario: Restoring a thread after restart

- **WHEN** the service restarts and the user continues an existing `thread_id`
- **THEN** the agent restores the stored messages for that thread

#### Scenario: Resuming an interrupted turn

- **WHEN** a turn is interrupted after one or more execution steps have
  completed
- **THEN** the stored state reflects the completed steps so the turn can resume
  without re-running them

### Requirement: Long-term memory across threads

The system SHALL store facts and preferences scoped to a `user_id` and
`agent_id`, and SHALL make them available to that user's later threads
regardless of `thread_id`.

#### Scenario: Recalling a fact in a later thread

- **WHEN** a fact is stored for a user in one thread
- **THEN** a later thread for the same user and agent can retrieve that fact

#### Scenario: Updating a stored fact

- **WHEN** the user states a new value for a fact that already exists
- **THEN** subsequent retrievals return the updated value and not the old one

#### Scenario: Forgetting stored memory

- **WHEN** a user requests deletion of a stored fact
- **THEN** subsequent retrievals no longer return that fact

### Requirement: Memory isolation between tenants

The system MUST scope every memory read and write by the identity provided with
the request, and MUST NOT return one user's or agent's memory to another.

#### Scenario: Cross-user isolation

- **WHEN** user A has stored conversation or long-term memory
- **THEN** user B's threads and long-term lookups never return user A's memory

#### Scenario: Cross-agent isolation

- **WHEN** the same user has memory for two different `agent_id` values
- **THEN** long-term lookups for one agent do not return the other agent's facts

#### Scenario: Missing identity is rejected

- **WHEN** a memory operation is requested without a `user_id` or `thread_id`
- **THEN** the system rejects the operation with a clear error instead of
  reading or writing unscoped memory

### Requirement: Memory backend is replaceable

The system SHALL expose memory through one backend-independent contract, with
an in-memory implementation for tests and local development and a durable
implementation for deployed environments, both satisfying the same behavior.

#### Scenario: Same behavior across backends

- **WHEN** the memory contract tests run against the in-memory backend and the
  durable backend
- **THEN** both backends satisfy the same continuity, recall, and isolation
  expectations

#### Scenario: Production uses durable storage

- **WHEN** the service runs in a deployed environment
- **THEN** it persists memory to the configured durable backend rather than
  process memory

### Requirement: Memory failures are surfaced

The system MUST report memory persistence or retrieval failures to the caller
and MUST NOT continue as if memory was successfully written or read.

#### Scenario: Backend unavailable on write

- **WHEN** the memory backend cannot store a turn or fact
- **THEN** the operation fails with an identifiable error and no success result
  is returned

#### Scenario: Backend unavailable on read

- **WHEN** stored memory cannot be retrieved
- **THEN** the operation fails with an identifiable error rather than silently
  continuing with fabricated or partial memory
