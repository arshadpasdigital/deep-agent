# Tasks

## 1. Service bootstrap and lifecycle

- [x] 1.1 Define the shared API success/error TypeScript contracts in `backend/packages/contracts` and verify they are type-importable by all four services without introducing runtime package coupling.
- [x] 1.2 Add per-service Zod environment schemas with actionable missing/invalid variable errors; add Bun tests for valid values, defaults, and invalid values in each service, plus missing-required-variable errors where the schema defines required values.
- [x] 1.3 Convert all four entry points to Express apps with Helmet, Morgan, built-in body parsers, `/health`, and `/api/v1` feature-router mounts; add service-level tests for health, middleware, and versioned routing without implementing domain behavior.
- [ ] 1.4 Add bounded SIGINT/SIGTERM HTTP shutdown handling to each service and verify it drains an in-flight request and exits within the deadline in lifecycle tests.

## 2. Gateway API behavior

- [ ] 2.1 Add gateway-owned success/error response helpers and centralized not-found/error middleware; verify known errors preserve status and unknown errors return a sanitized 500 envelope.
- [ ] 2.2 Move gateway proxy routes to `/api/v1/auth`, `/api/v1/notifications`, and `/api/v1/agent`; verify upstream response status, headers, and body pass through and JSON request bodies reach the internal service correctly.
- [ ] 2.3 Document the gateway response envelopes and new versioned client paths in backend docs; verify examples match the shared contracts and the `/health` path remains unchanged.

## 3. Container integration

- [ ] 3.1 Update each service Dockerfile to install production dependencies from its own `package.json` and `bun.lock` with a frozen install; verify each custom image builds without a root package manifest or published internal port.
- [ ] 3.2 Build and start the stack using the root `docker-compose.yml`; verify every service health check passes, only the gateway is host-published, versioned proxy routing works, and Compose termination triggers graceful service shutdown.
