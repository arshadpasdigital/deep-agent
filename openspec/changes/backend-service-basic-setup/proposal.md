# Proposal

## Why

The four Bun services currently start native Bun HTTP handlers, while Express,
Helmet, Morgan, and Zod are already listed in their individual service
manifests. A consistent Express bootstrap will give each service predictable
middleware, configuration validation, versioned routing, and shutdown behavior
before domain APIs are built.

## What Changes

- Replace each service's native HTTP handler bootstrap with an Express server
  while retaining Bun as the runtime.
- Add per-service Zod environment validation with clear startup errors for
  missing or invalid required values.
- Standardize request parsing, Helmet security headers, and HTTP request logging
  across the gateway, auth, notification, and deep-agent services.
- Add graceful HTTP server shutdown handling to each service.
- Mount feature routers beneath a consistent `/api/v1` prefix and preserve an
  unversioned health endpoint for container health checks.
- Give the gateway a shared success/error response contract and centralized
  error-handling middleware, including safe handling of unknown errors.
- Install each service's declared dependencies in its own Docker image from its
  service-local Bun lockfile.

## Capabilities

### New Capabilities

- `backend-service-bootstrap`: Service startup, environment validation,
  middleware, versioned routing, and graceful shutdown conventions.
- `gateway-api-errors`: Standard API response envelopes and centralized gateway
  error serialization.

### Modified Capabilities

None.

## Impact

- **BREAKING**: changes the gateway's public proxy prefixes from `/api/auth`,
  `/api/notifications`, and `/api/agent` to `/api/v1/auth`,
  `/api/v1/notifications`, and `/api/v1/agent`.
- Affects `backend/services/{api-gateway,auth-service,notification-service,deepagent-service}/src/`
  and each service Dockerfile.
- Uses the Express, Helmet, Morgan, and Zod dependencies already declared in
  each service; no new dependency or shared/root runtime package is proposed.
- Internal service ports and Docker networking remain unchanged. The gateway
  remains the only service port published to the host.
