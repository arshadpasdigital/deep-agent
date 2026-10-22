# Design

## Context

The backend directory currently contains only `.gitignore`. The target is a Bun backend scaffold with four services and one root Compose file. This implementation creates structure and dependency-free service entry points only; business features and third-party JavaScript integrations will be added later. See `proposal.md` and the `backend-runtime-structure` spec for the motivation and behavior contract.

## Goals / Non-Goals

**Goals:**

- Establish a readable service-oriented repository layout that works with Bun.
- Keep feature code separate from bootstrap and external-system adapters.
- Make root Compose the local orchestration boundary.
- Keep internal service ports private and resolve dependencies through Compose service names.
- Reserve service-owned bootstrap and feature boundaries for later integrations.
- Keep shared packages source-only and focused on contracts; include only infrastructure configuration that is currently needed.
- Create the scaffold without installing third-party JavaScript libraries.

**Non-Goals:**

- Implementing agent features, authentication, persistence models, or public endpoints.
- Choosing a production secrets manager, deployment platform, or observability stack.
- Requiring every service to expose both a gRPC client and a gRPC server.
- Splitting every service into a separate repository.

## Decisions

### Repository layout

The backend repository will use these top-level areas:

```text
backend/
├── docker-compose.yml
├── .env.example
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── notification-service/
│   └── deepagent-service/
├── packages/
│   └── contracts/             # source-only shared TypeScript types/constants
├── infrastructure/
│   └── mongodb/               # MongoDB initialization/configuration notes
└── docs/
```

Each service is a separate runnable project inside the backend repository. Its package manifest owns that service's dependencies. The initial manifests contain no third-party dependencies and no install is run. The root contains orchestration, shared source contracts, and infrastructure configuration rather than application runtime dependencies. The four initial services are API Gateway, Auth Service, Notification Service, and DeepAgent Service.

### Feature-based service layout

Each service will use a consistent shape:

```text
services/<service>/
├── src/
│   ├── bootstrap/
│   ├── features/
│   │   └── <feature>/
│   │       ├── <feature>.controller.ts
│   │       ├── <feature>.router.ts
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.repository.ts
│   │       ├── <feature>.schema.ts
│   │       └── <feature>.types.ts
│   ├── infrastructure/
│   ├── middleware/
│   └── main.ts
├── Dockerfile
└── package.json
```

`main.ts` delegates startup to `bootstrap/`. Feature services contain business use cases; repositories abstract persistence; controllers and routers adapt transport requests; infrastructure adapters wrap external systems.

### Bootstrap and service responsibilities

Bootstrap modules load service configuration and start the Bun HTTP server. This scaffold uses Bun's built-in server API and has no Express or other third-party runtime library. The responsibilities are:

- API Gateway: single client entry point and path-based forwarding to internal services;
- Auth Service: future registration, login, JWT, and MongoDB-backed user features;
- Notification Service: future email delivery integration;
- DeepAgent Service: future agent and model-provider logic.

Shared contracts are plain TypeScript source under `packages/contracts`; each Docker build copies this source into the image when needed. This is not an installed library and has no package installation step. gRPC definitions can be added there if/when a service boundary is assigned to gRPC.

### Docker Compose and networking

The single root `docker-compose.yml` builds all four application images from their service-local Dockerfiles and starts them with the MongoDB infrastructure image. Every application container runs Bun. All containers join a user-defined bridge network. Only `api-gateway` receives a host `ports` mapping; the other application services and MongoDB have no published host ports. Clients call gateway routes, and the gateway forwards to `auth-service`, `notification-service`, or `deepagent-service` by Compose service name.

The Compose service name is the service discovery contract. `ports` publishes a container port on the host and is used only by the gateway. Internal communication does not require host port publication; `expose` is optional documentation and is not required for network connectivity.

### Environment ownership

The root `.env` is used for Compose interpolation and stack-level values such as image tags or the gateway host port. Each service has an ignored runtime `.env` and a committed `.env.example` containing only that service's configuration. Compose passes the service-specific file to the corresponding container through `env_file` or explicit environment mapping.

Service bootstrap validates required values with the service's configuration schema. Secrets are not committed and production secret delivery remains outside this change.

### Packages and infrastructure boundaries

`packages/contracts/` contains source-only types and constants shared by services. Dockerfiles copy it into an image when needed, and source imports reference that copied code. It has no third-party library dependencies, package manifest, or lockfile in this scaffold. Service runtime dependencies such as Express belong in that service's own manifest when explicitly introduced later.

`infrastructure/mongodb/` documents MongoDB's role and any future initialization scripts. It is configuration/deployment support, not application code imported by a service. Other infrastructure directories are added only when the project adopts those systems.

## Risks / Trade-offs

- [Risk] A shared package can become a dumping ground for business logic or runtime libraries -> keep `packages/` limited to contracts and technical utilities and install runtime libraries in each consuming service.
- [Risk] Root and service environment variables can drift -> keep `.env.example` files beside their owners and validate configuration during bootstrap.
- [Risk] Internal service discovery becomes coupled to Compose names -> centralize service URLs in validated configuration and use the same names in local orchestration and tests.
- [Risk] Bun and container tooling may expose dependency or runtime differences -> define one Bun startup command per service and verify each custom image independently before wiring the full Compose stack.
- [Risk] Unnecessary gRPC servers increase operational complexity -> add gRPC endpoints only for declared downstream callers and document each service dependency.
