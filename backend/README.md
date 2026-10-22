# Deep Agent Backend

The backend is organized as four separately built Bun services:

- `api-gateway`: the only client-facing application service. It forwards `/api/auth`, `/api/notifications`, and `/api/agent` requests over the private Compose network.
- `auth-service`: reserved for registration, login, JWT, and MongoDB-backed user features.
- `notification-service`: reserved for email delivery.
- `deepagent-service`: reserved for agent and model-provider logic.

Each service has its own `package.json`, source tree, and Dockerfile. The manifests currently contain no third-party dependencies. The Dockerfiles run Bun directly and do not install packages.

`docker-compose.yml` is the only Compose file. It builds all four services and starts MongoDB. Only the API Gateway publishes a host port; other containers are reached by their Compose service names. `packages/contracts` is source-only shared TypeScript and is copied into each application image at build time. It is not installed as a package.

## Local development

Copy `.env.example` to `.env` to override Compose-level values, then run:

```sh
docker compose up --build
```

The default MongoDB credentials are for local development only. Do not reuse them outside a local environment. Each service can also read a private, ignored `.env` file in its own directory; `.env.example` files document service-specific settings.

The service business features are placeholders. Auth, MongoDB persistence, email delivery, JWT creation, and AI execution are not implemented yet. Each service exposes `/health`; the internal services return `501` for other routes until their features are built.
