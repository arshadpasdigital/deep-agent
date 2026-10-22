# Proposal

## Why

The backend directory currently has no service implementation, so it needs an initial structure before the four-service agent backend can be built. Defining service boundaries, internal communication, configuration ownership, Docker orchestration, and shared contracts now gives implementation a clear starting point.

## What Changes

- Define a Bun-based backend repository layout with four independently built application containers: API Gateway, Auth Service, Notification Service, and DeepAgent Service.
- Define a feature-based structure inside each service using controllers, routers, services, repositories, schemas, and types.
- Define per-service bootstrap modules and feature placeholders that keep each service's concerns separate.
- Define exactly one root-level Docker Compose file that starts all four custom service containers and required third-party infrastructure containers together.
- Define private Docker-network communication where only the gateway publishes a host port; clients access backend APIs through the gateway, while services communicate through Docker DNS service/container names.
- Define gRPC conventions so services expose or consume gRPC only when their dependency graph requires it.
- Define environment-variable ownership using root Compose variables plus service-specific runtime environment files.
- Define the limited role of shared packages for contracts and reusable technical utilities, without moving service business logic into them.
- Correct dependency ownership so Express and other runtime libraries are installed by the service that uses them, not by a root application package shared accidentally across containers.
- Create only dependency-free Bun scaffolding and manifests in this change; do not install third-party libraries or implement registration, email delivery, JWT issuance, or AI workflows.

## Capabilities

### New Capabilities

- `backend-runtime-structure`: Establishes the backend repository structure, service boundaries, bootstrap conventions, internal networking, configuration ownership, and local orchestration behavior.

### Modified Capabilities

- None.

## Impact

- Affects the `backend/` repository layout and future Bun service entry points.
- Adds the planned root `docker-compose.yml`, independent service Dockerfiles and package manifests, Compose network configuration, and environment-file conventions.
- Establishes a source-only shared contracts boundary and MongoDB infrastructure configuration location.
- Does not implement business features, public API endpoints, authentication behavior, or production deployment infrastructure.
