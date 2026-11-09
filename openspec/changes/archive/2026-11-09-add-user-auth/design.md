# Design

## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `bootstrap/auth.ts` builds a Better Auth instance with the MongoDB adapter and
  `emailAndPassword: { enabled: true }` only. `main.ts` mounts
  `toNodeHandler(auth)` at `/api/auth/*splat`.
- Better Auth 1.7.12 is installed. The `email-otp` and `two-factor` plugins ship
  with it; `socialProviders.google` is supported by the core config.
- `features/auth/auth.router.ts` is a 501 placeholder; `features/user` already
  reads sessions and users.
- The gateway has CORS with `credentials: true`, but `proxyRouter` is empty and
  `forwardRequest()` is never mounted. Only `/api/v1` is wired.
- The in-progress `backend-service-basic-setup` change moves public prefixes to
  `/api/v1/auth`, `/api/v1/notifications`, and `/api/v1/agent`.
- The notification service has a working `sendMail()` and `EMAIL_*` config, but
  its email feature is a placeholder. Both services already define the
  `auth.events` RabbitMQ exchange.
- Config is validated at import time in both services; tests import these modules.

## Goals / Non-Goals

**Goals:**

- Email/password signup with email OTP verification, and email-code sign-in.
- Google sign-in that needs no OTP.
- A browser-reachable auth surface through the gateway with correct cookies.
- Explicit, testable OTP delivery failure behavior.
- No new runtime dependencies.

**Non-Goals:**

- The frontend page and client (follow-up `add-auth-page`).
- SMS/phone OTP, password reset, change-email, admin or organization features.
- Provisioning Google or SMTP credentials.
- Reworking the gateway's general versioned proxy (owned by the other change).

## Decisions

### Better Auth owns identity; plugins are configuration, not custom code

Extend `createAuth()` with:

- `emailAndPassword: { enabled: true, requireEmailVerification: true }`
- `emailOTP` with `sendVerificationOnSignUp: true`,
  `overrideDefaultEmailVerification: true`, `otpLength: 6`, `expiresIn: 300`,
  `allowedAttempts: 3`, `storeOTP: "hashed"`, and a send rate limit
- `socialProviders.google` from environment credentials
- `trustedOrigins` from configuration, including the Vite dev origin
- `baseURL` set to the gateway's public origin

Keeping identity in Better Auth avoids hand-rolled OTP tables, token hashing,
session issuance, and account linking. The alternative - custom OTP endpoints and
sessions - duplicates security-sensitive behavior the library already tests.

Google identities are treated as verified, so the OTP requirement applies only to
password accounts. Account linking for an existing *unverified* email is refused
to prevent account takeover; an existing *verified* email signs into the same
account.

### OTP delivery goes through the notification service over internal HTTP

`sendVerificationOTP` calls a notification service endpoint backed by the
existing `sendMail()`. The call is internal-only (not exposed by the gateway) and
authenticated with a shared `INTERNAL_SERVICE_TOKEN`.

Alternatives considered:

- **RabbitMQ:** already scaffolded for `auth.events`, but OTP is user-blocking.
  Fire-and-forget makes "code never arrived" indistinguishable from success and
  requires a consumer plus DLQ work. Use it for non-blocking mail later.
- **SMTP from auth-service:** duplicates mail ownership and configuration that
  the notification service already owns.

Development fallback: when `NODE_ENV !== "production"` and `EMAIL_HOST`/`EMAIL_FROM`
are unset, the notification service logs the OTP and reports success. In
production, missing mail configuration fails the send and returns a generic
delivery error; the email is not marked verified.

The auth service awaits the send. Better Auth catches a delivery failure and logs
it; the email remains unverified, while the HTTP response stays generic so account
existence is not revealed.

### Standalone MongoDB disables adapter transactions

The project Compose stack runs MongoDB as a single standalone node. Better Auth's
MongoDB adapter defaults to transactions, which fail on a standalone server with
"Transaction numbers are only allowed on a replica set member or mongos". The
adapter is configured with `transaction: false`. If the deployment later moves to
a replica set, transactions can be enabled again.

### Gateway exposes `/api/auth/*` as a carve-out

Mount a dedicated auth proxy at the app level, before the versioned router:

```
GET/POST /api/auth/*  --> auth-service /api/auth/*
GET/POST /api/v1/*    --> versioned feature proxy (other change)
```

This keeps Better Auth's canonical path and cookie scope stable. It also resolves
the overlap with `backend-service-basic-setup`: `/api/v1/auth` remains reserved
for domain routes, while Better Auth keeps `/api/auth`. The proxy must forward
the request body untouched (auth calls are JSON or form-encoded), preserve
`set-cookie`, and return the upstream status and headers unchanged.

Alternative considered: rewrite `/api/v1/auth/*` to `/api/auth/*`. It removes the
second prefix but couples Better Auth's base path to a versioning decision and
makes cookie paths and client configuration harder to reason about.

### Session and cookie configuration

- `BETTER_AUTH_URL` is the gateway's public origin, so cookies and redirect URLs
  point at the browser-facing host.
- `trustedOrigins` includes the frontend origin (`http://localhost:5173` in dev).
- The gateway keeps `credentials: true` and exposes the configured origin.
- The auth client (next change) must send credentials with every request.
- Session cookies stay HTTP-only; the browser never reads the token.

### OTP security envelope

- Codes are stored hashed, expire after five minutes, and are single-use.
- `allowedAttempts` bounds guessing; Better Auth rate-limits sends.
- Responses for sign-in code requests do not reveal whether an account exists.
- Delivery errors are logged server-side and surfaced as a generic message.
- Passwords and codes are never logged outside the documented dev fallback.

### Configuration and wiring

Auth service additions: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`TRUSTED_ORIGINS` (comma-separated), `NOTIFICATION_SERVICE_URL`,
`INTERNAL_SERVICE_TOKEN`. Notification service: `INTERNAL_SERVICE_TOKEN`, and
`EMAIL_*` becomes required in production but optional in development. Compose
passes the same secret to both services. `.env.example` documents every value.

### Testing

- Auth service: config validation; Google provider presence when credentials are
  set; OTP issue/verify/expiry/attempts/rate-limit using the Better Auth handler
  against a test MongoDB (or an in-memory test database when supported).
- Notification service: endpoint auth, payload validation, mailer invocation,
  dev fallback logging, and failure propagation with an injected transport.
- Gateway: `/api/auth/*` forwards method, body, cookies, and upstream response
  headers to a stub auth upstream, and does not swallow `set-cookie`.
- Contract: unverified password sign-in is rejected; verified sign-in works;
  email-code sign-in works; Google config is accepted.

## Risks / Trade-offs

- [Risk] The `/api/auth` carve-out conflicts with the other change's blanket
  `/api/v1` prefixes → implement the carve-out before the versioned router and
  document `/api/v1/auth` as domain-only; reconcile at merge.
- [Risk] Cookie/CORS/`trustedOrigins` misconfiguration makes sessions silently
  fail → set `BETTER_AUTH_URL` to the gateway origin and test a credentialed
  cross-origin request.
- [Risk] Awaiting OTP delivery leaks timing or blocks auth → keep responses
  generic, log failures, and keep the send timeout bounded.
- [Risk] OTP delivery is a single point of failure → production fails explicitly;
  development logs the code; the endpoint is retryable.
- [Risk] Google linking could enable takeover → never auto-link an unverified
  existing email; require verification first.
- [Risk] Better Auth upgrades change plugin behavior → pin the installed version
  and cover the flows with handler-level tests.

## Migration Plan

1. Add configuration fields and examples; keep current deployments starting with
   email/password only until credentials are provided.
2. Add the notification email endpoint and mailer tests.
3. Extend the Better Auth configuration with emailOTP and Google; add auth
   service tests.
4. Mount the gateway `/api/auth/*` proxy and test forwarding.
5. Enable `requireEmailVerification` last, after OTP delivery is verified, so no
   one is locked out mid-deploy.
6. Rollback: disable the plugins and proxy mount, restore the previous auth
   config; no schema migration is required because Better Auth owns its
   collections and existing users remain valid.

## Open Questions

- Are Google OAuth client credentials available for local verification, and what
  redirect URI is registered?
- Is SMTP available locally, or should the dev log fallback be the only local
  delivery path?
- Should password reset use the same OTP delivery now, or stay a later change?
