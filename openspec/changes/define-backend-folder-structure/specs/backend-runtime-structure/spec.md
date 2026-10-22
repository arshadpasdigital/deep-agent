# Spec Delta

## Purpose

Defines a consistent backend runtime structure so independently deployable Bun services can be developed, started, and connected predictably through private service networking and explicit configuration ownership.

## ADDED Requirements

### Requirement: Backend services have consistent boundaries

Each backend service SHALL have an identifiable runtime entry point, bootstrap boundary, feature boundary, infrastructure-adapter boundary, and owned dependency manifest, and SHALL run in its own Bun container.

#### Scenario: New service is added

- **WHEN** a new backend service is introduced
- **THEN** its Bun runtime entry point, package manifest, dependencies, and bootstrap modules are located within that service and its business capabilities are organized under feature boundaries

#### Scenario: Initial backend scaffold is created

- **WHEN** the backend scaffold is created
- **THEN** it contains the API Gateway, Auth Service, Notification Service, and DeepAgent Service, each with a Bun entry point and service-owned package manifest

### Requirement: Internal services remain private

The backend runtime SHALL use one root Docker Compose file to start all application and required infrastructure containers, expose only the gateway to the host network, and allow internal containers to communicate over a shared private Docker network.

#### Scenario: Backend stack starts locally

- **WHEN** the root Compose stack is started
- **THEN** all containers start from the root Compose definition, the gateway is reachable through its published host port, and internal services are reachable by their Compose service names without host port publication

#### Scenario: Client requests an internal capability

- **WHEN** a client calls an API provided by an internal service
- **THEN** the client sends the request to a gateway API and the gateway forwards it over the private network, without requiring a public port or direct client route to the internal service

### Requirement: Service communication uses declared dependencies

Each service SHALL declare only the communication adapters it needs, including gRPC clients, gRPC servers, HTTP clients, or message-broker consumers and publishers.

#### Scenario: Service does not expose gRPC

- **WHEN** no other service calls a service through gRPC
- **THEN** that service does not need to initialize a gRPC server solely for structural symmetry

### Requirement: Configuration ownership is explicit

Each service SHALL own and validate its runtime configuration, while root Compose configuration SHALL be limited to stack-level orchestration values and service wiring.

#### Scenario: Service starts with missing configuration

- **WHEN** a required service-specific environment variable is absent or invalid
- **THEN** the service fails during bootstrap with an actionable configuration error rather than starting partially configured

### Requirement: Runtime dependencies belong to their consuming service

Each application service SHALL declare and install its runtime libraries in its own package manifest and container image.

#### Scenario: Gateway uses Express

- **WHEN** the gateway uses Express
- **THEN** Express is declared and installed for the gateway container and is not required as a root application dependency for other service containers

#### Scenario: Dependency-free scaffold is prepared

- **WHEN** the initial folder and file scaffold is created without third-party dependencies
- **THEN** each service manifest contains only its scripts and metadata, and no package installation is required

### Requirement: Shared code has stable ownership

Shared packages SHALL contain only cross-service contracts or reusable technical utilities, and service-specific business rules SHALL remain within the owning service.

#### Scenario: Service business rule changes

- **WHEN** a business rule applies only to one service
- **THEN** the rule is changed in that service without requiring unrelated services to import its feature implementation
