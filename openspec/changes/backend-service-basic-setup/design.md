# Design

## Context

See `proposal.md` for motivation. The backend contains four separately
packaged Bun services and a root Compose file. Each service already has its own
`package.json` and `bun.lock`; Express, Helmet, Morgan, and Zod are already
declared in the service manifests. The current entry points use `Bun.serve`,
the gateway proxy prefixes are unversioned, and its service health endpoints
are `/health`. Dockerfiles currently copy manifests and source but do not
install dependencies from the service lockfiles.

## Goals / Non-Goals

**Goals:**

- Establish the same HTTP lifecycle and middleware ordering in all four
  services while keeping each service independently buildable and runnable.
- Make configuration failures clear before a service begins listening.
- Keep the gateway as the only host-published service and retain Compose
  service-name networking.
- Define a stable gateway-owned response contract without changing transparent
  proxy response behavior.

**Non-Goals:**

- Implementing domain routes, authentication, email delivery, agent execution,
  or gRPC service behavior.
- Moving dependencies into a backend root manifest or introducing shared
  runtime packages.
- Changing Compose network topology, ports, databases, or message brokers.

## Decisions

### Keep bootstrap code service-local

Each service owns its Express app, config schema, and server lifecycle under
its existing `src/bootstrap/` and `src/main.ts` structure. Repeating a small
amount of bootstrap code is preferable to importing runtime code across
independently built services. Shared API response types may be placed in the
existing `backend/packages/contracts` area because Dockerfiles already copy
that package; runtime middleware and error classes remain gateway-local.

Alternative considered: a shared bootstrap runtime package. This would reduce
duplication, but would couple each image to a shared package build/import
contract that the current service-local manifests do not define.

### Express middleware and route order

Build each Express app by installing Helmet, request logging, and JSON/form
body parsers before health and feature routers, then a not-found handler and
error middleware. Use Express's built-in parsers rather than adding a separate
body-parser dependency. The gateway proxy must preserve its upstream response;
when parsed request bodies are forwarded, the proxy adapter reconstructs the
outgoing body and removes or recalculates stale framing headers. Unsupported
streaming/body formats should not be silently corrupted.

Feature routers mount under `/api/v1`; the public gateway routes become
`/api/v1/auth`, `/api/v1/notifications`, and `/api/v1/agent`, matching the
forwarded paths on the corresponding services. `/health` remains unversioned
because Compose health checks depend on it. The old gateway prefixes are not
retained as aliases in this change; this is the breaking path change called
out in `proposal.md`.

Alternative considered: retain legacy gateway paths and rewrite only upstream
paths. That keeps clients compatible but leaves the public API unversioned and
creates two routing conventions, contrary to the requested versioned router.

### Validate each service's own environment

Each service defines a Zod schema beside its current config module and parses
that service's environment at startup. Requiredness is based on the service's
current responsibilities: required values fail fast with variable names and
field-level reasons; intentional defaults (such as the current local port and
Compose service URLs) remain explicit; credentials for features not yet
implemented remain optional until the feature is enabled. Compose continues to
provide service-specific values through its existing environment and
`env_file` configuration. Bun's environment loading remains the runtime
mechanism; no root `.env` is introduced.

Alternative considered: one shared root env file. Per-service env ownership
avoids making unrelated secrets available to every container and matches the
existing `.env.example` files.

### Graceful shutdown is HTTP-scoped and bounded

On SIGINT or SIGTERM, each service stops accepting new HTTP connections, waits
for in-flight requests, then exits. A bounded timeout prevents a stuck request
from blocking container replacement indefinitely. The implementation should
use APIs supported by Bun's Node-compatible HTTP server and avoid claiming to
close future database, gRPC, or queue clients that are not initialized in this
change.

Alternative considered: immediate process exit. It is simpler but can cut off
responses during Compose shutdown or redeployment.

### Gateway errors use a typed envelope

Define shared TypeScript response envelope types in `packages/contracts` for
gateway-owned JSON success and error responses. Gateway-local error handling
maps known status/code errors to safe public messages and maps unknown errors
to a generic 500 response; stack traces and exception internals are logged
server-side only. Proxy responses from upstream services remain pass-through
and are not wrapped, so this change does not assert that future service
endpoints already follow the envelope.

### Install dependencies from each service lockfile in its image

Each Docker build copies its service-local manifest and `bun.lock`, runs a
frozen production install in the image, then copies that service's source and
the existing shared contracts source. There remains no root-level package
manifest or shared node_modules tree.

Alternative considered: install packages from a root workspace. This conflicts
with the service-local dependency ownership and independently built image model.

## Risks / Trade-offs

- [Risk] Switching gateway prefixes breaks callers using the existing paths →
  document the new `/api/v1/...` paths and update any callers in the same
  implementation; this change deliberately does not add legacy aliases.
- [Risk] Parsing a proxy request body can change streaming or framing behavior
  → limit parsing to supported payloads and test JSON forwarding, empty bodies,
  and relevant headers; preserve transparent response status, headers, and
  body.
- [Risk] A graceful-shutdown timeout may be too short for long agent requests
  → make the timeout configurable with a bounded default and exercise it in a
  lifecycle test.
- [Risk] Duplicated service bootstraps can drift → keep middleware order and
  lifecycle behavior covered by equivalent service-level tests and document
  the convention.

## Migration Plan

1. Add/adjust service bootstrap, configuration validation, middleware, health,
   versioned router mounts, and shutdown handling while retaining existing
   service ports.
2. Add the gateway response contract and error middleware; update proxy paths
   and client-facing documentation to `/api/v1/...`.
3. Update each Dockerfile to install from its service-local lockfile, then
   build and start all services through the existing root Compose file.
4. Verify health checks, gateway routing, error envelopes, and shutdown. Roll
   back by restoring the previous service entry points, gateway prefixes, and
   Dockerfiles; no persisted data or schema migration is introduced.

## Open Questions

None. The route prefix and response envelope choices are captured in the
requirements above; service-specific required environment fields can be
finalized from each service's existing config and `.env.example` during
implementation without changing the contract.
