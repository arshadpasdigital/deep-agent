# Proposal

## Why

The auth service currently enables only Better Auth email/password sign-in. It has
no Google provider, no email verification or OTP flow, and no working path from
the browser: the gateway proxy router is empty, so `/api/auth/*` never reaches the
auth service. Until those exist, an auth page cannot be built against real
behavior. This change establishes the backend identity vertical so the page can
be a separate, focused change.

## What Changes

- Enable the Better Auth `emailOTP` plugin for email/password accounts:
  verification on sign-up and email-code sign-in, with a 6-digit code, short
  expiry, bounded attempts, hashed OTP storage, and rate limiting.
- Require email verification for password accounts. Google accounts arrive
  verified and skip OTP.
- Enable `socialProviders.google` with configured client credentials and trusted
  origins for the browser application.
- Add an internal notification endpoint that sends OTP email through the existing
  `sendMail()` transport. The auth service calls it when Better Auth requests an
  OTP. When SMTP is not configured, development logs the OTP instead of failing.
- Wire a gateway `/api/auth/*` proxy carve-out to the auth service, preserving
  request cookies and upstream response headers. `/api/v1/*` remains the
  feature-API prefix, which resolves the path conflict with the in-progress
  `backend-service-basic-setup` change.
- Extend service configuration and examples for Google credentials, notification
  service URL, trusted origins, and required email settings.
- Add tests for OTP issue/verify/expiry/attempts/rate limiting, Google provider
  configuration, the notification email endpoint, and gateway auth proxying.

Out of scope: the auth page itself (follow-up change `add-auth-page`), SMS or
phone OTP, password reset, admin roles, and provisioning real Google or SMTP
credentials.

## Capabilities

### New Capabilities

- `user-auth`: Registration, password sign-in, Google sign-in, email OTP
  verification, email-code sign-in, session establishment, and the delivery and
  failure behavior those flows depend on.

### Modified Capabilities

None. No existing capability covers authentication.

## Impact

- **Code**: `backend/services/auth-service/src/bootstrap/auth.ts` and config;
  `backend/services/notification-service` email feature and transport; API
  gateway proxy router/controller.
- **APIs**: Better Auth endpoints under `/api/auth/*` become reachable through
  the gateway; a new internal email-send endpoint is added to the notification
  service.
- **Configuration**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `NOTIFICATION_SERVICE_URL`, trusted origins, and `EMAIL_*` values; `.env.example`
  files and Compose environment.
- **Dependencies**: no new packages; Better Auth 1.7.12 already ships the
  `email-otp` plugin and Google provider, and notification-service already has
  `nodemailer`.
- **Security**: OTP storage, expiry, attempt limits, and rate limiting; cookie
  scoping and `trustedOrigins`; avoiding account enumeration in responses.
- **Risk**: the gateway path change overlaps `backend-service-basic-setup`, and
  Google/SMTP credentials are external prerequisites for end-to-end verification.
