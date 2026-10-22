# Spec Delta

## Purpose

Defines predictable JSON response envelopes for gateway-owned API responses and
safe, centralized serialization of errors produced by the API gateway.

## ADDED Requirements

### Requirement: Gateway-owned responses use a common envelope
Responses created by the gateway SHALL use a JSON envelope with `success`, `message`, and `data` fields for success, or `success` and an `error` object containing `code` and `message` for failure.

#### Scenario: Gateway creates a successful response
- **WHEN** a gateway-owned API operation succeeds
- **THEN** its JSON response has `success: true`, a `message`, and a `data` field

#### Scenario: Gateway creates an error response
- **WHEN** the gateway creates an API error response
- **THEN** its JSON response has `success: false` and an `error` object with a stable code and readable message

### Requirement: Gateway centralizes and sanitizes errors
The gateway SHALL route errors raised during request handling through a centralized error handler, preserve an appropriate HTTP status, and avoid exposing stack traces or internal exception details in client responses.

#### Scenario: Known client or routing error occurs
- **WHEN** request handling raises a recognized client or routing error
- **THEN** the gateway returns its error envelope with the corresponding HTTP status and a safe message

#### Scenario: Unexpected error occurs
- **WHEN** request handling raises an unrecognized error
- **THEN** the gateway returns a generic internal error envelope with HTTP status 500 and does not disclose internal details

### Requirement: Gateway preserves proxied service responses
The gateway SHALL pass through the upstream HTTP status, headers, and response body for a successfully completed proxy exchange rather than wrapping or rewriting the service response.

#### Scenario: Upstream service returns a response
- **WHEN** the gateway successfully receives an upstream service response
- **THEN** the client receives that upstream response without gateway envelope transformation
