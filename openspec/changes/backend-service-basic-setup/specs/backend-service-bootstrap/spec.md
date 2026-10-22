# Spec Delta

## Purpose

Defines consistent HTTP startup, configuration validation, and shutdown behavior
for the gateway and each independently deployed backend service.

## ADDED Requirements

### Requirement: Services expose a versioned HTTP API
Each backend service SHALL expose its feature API beneath `/api/v1` and retain an unversioned `/health` endpoint for container health checks.

#### Scenario: Request reaches a versioned feature router
- **WHEN** a request targets a registered feature route beneath `/api/v1`
- **THEN** the service dispatches the request to that feature router

#### Scenario: Health check remains available
- **WHEN** a request targets `/health`
- **THEN** the service returns its health response without requiring the API version prefix

### Requirement: Services validate configuration before listening
Each service SHALL validate its environment configuration at startup and SHALL report the name of each missing or invalid required variable before exiting without opening its HTTP listener.

#### Scenario: Required environment value is missing
- **WHEN** a service starts without a required environment variable
- **THEN** startup fails with an actionable message naming the variable

#### Scenario: Configuration is valid
- **WHEN** all required environment values pass validation
- **THEN** the service may proceed to initialize and listen

### Requirement: Services apply baseline HTTP middleware
Each service SHALL parse supported request bodies, apply HTTP security headers, and emit an HTTP request log for requests handled by its server.

#### Scenario: Request passes through the server middleware
- **WHEN** a request reaches a service
- **THEN** its supported body is parsed, security headers are applied, and request logging is emitted

### Requirement: Services shut down gracefully
Each service SHALL handle termination signals by stopping acceptance of new HTTP requests and allowing in-flight requests to complete before exiting, subject to a bounded shutdown period.

#### Scenario: Service receives a termination signal
- **WHEN** the process receives a termination signal
- **THEN** it closes its HTTP listener, drains in-flight requests within the configured shutdown period, and exits
