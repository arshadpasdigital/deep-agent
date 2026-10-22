# Tasks

## 1. Establish the Bun backend workspace layout

- [x] 1.1 Create `api-gateway`, `auth-service`, `notification-service`, and `deepagent-service` under `services/`, each with a dependency-free Bun package manifest; verify all four service roots and manifests exist.
- [x] 1.2 Add a Bun-native HTTP entry point and bootstrap configuration for each service; verify each health handler loads and responds using only Bun built-ins, with no package installation.
- [x] 1.3 Add feature-based placeholders for gateway routing, auth, email notifications, and agent logic, with controller/router/service/repository/schema/type file boundaries where applicable; verify the folders communicate ownership without claiming unimplemented business behavior.

## 2. Define shared contracts and infrastructure boundaries

- [x] 2.1 Add a source-only `packages/contracts` module for shared service names and response types; verify a service can import the shared TypeScript source without a package manager install.
- [x] 2.2 Add `infrastructure/mongodb/README.md` describing the Auth Service database relationship and where future initialization scripts belong; verify infrastructure configuration is kept outside service feature code.

## 3. Add service bootstrap and configuration conventions

- [x] 3.1 Add service-owned configuration loaders for ports and internal service URLs using Bun environment values; verify invalid ports fail with a clear startup error.
- [x] 3.2 Add committed `.env.example` files beside each service and a root `.env.example` for MongoDB local development; verify actual `.env` files remain ignored.

## 4. Add root Docker Compose orchestration

- [x] 4.1 Add service-local Bun Dockerfiles for all four services without dependency-install commands; verify each Dockerfile copies the intended service source and runs its Bun entry point.
- [x] 4.2 Add the single root `docker-compose.yml` to build the four services and run the MongoDB image; verify Compose configuration resolves.
- [x] 4.3 Configure internal service URLs using Compose service names on a shared bridge network; verify no internal application service or database has a host port mapping.
- [x] 4.4 Publish only the API Gateway port and configure gateway forwarding for `/api/auth`, `/api/notifications`, and `/api/agent`; verify the gateway is the only client-facing service.

## 5. Verify the integrated local stack

- [x] 5.1 Document the scaffold, service responsibilities, gateway route prefixes, local Compose startup, and the fact that business integrations/dependencies remain to be added; verify the README matches the actual files.
- [x] 5.2 Validate the final directory tree and Compose configuration without installing libraries or starting/pulling containers; verify only the gateway has a published application port.
