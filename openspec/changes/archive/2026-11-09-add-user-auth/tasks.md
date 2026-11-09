# Tasks

## 1. Configuration and environment

- [x] 1.1 Extend auth-service configuration with `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `TRUSTED_ORIGINS`, `NOTIFICATION_SERVICE_URL`, and
  `INTERNAL_SERVICE_TOKEN`; verify valid values, optional Google credentials, and
  missing-required errors in `src/bootstrap/config.test.ts`.
- [x] 1.2 Extend notification-service configuration with
  `INTERNAL_SERVICE_TOKEN` and production-required `EMAIL_HOST`/`EMAIL_FROM`;
  verify development allows missing mail settings and production rejects them in
  its config test.
- [x] 1.3 Document all new variables in each service's `.env.example` and pass
  the shared internal token through Compose; verify every schema variable appears
  in an example and each service builds.

## 2. Notification email delivery

- [x] 2.1 Add an internal email endpoint (not reachable through the gateway) that
  validates `{ to, subject, text, html }`, requires the internal token, and calls
  `sendMail()`; verify success, unauthorized, and invalid-payload cases with an
  injected transport.
- [x] 2.2 Implement the development fallback: when mail is unconfigured and
  `NODE_ENV` is not production, log the message and return success; in production
  return a delivery error. Verify both branches.
- [x] 2.3 Render OTP mail content containing the code, the action it authorizes,
  and its expiry; verify the generated message includes all three.

## 3. Auth service identity flows

- [x] 3.1 Extend `bootstrap/auth.ts` with the `emailOTP` plugin
  (`sendVerificationOnSignUp`, `overrideDefaultEmailVerification`, 6 digits,
  300-second expiry, 3 attempts, hashed storage, send rate limit) and
  `trustedOrigins`/`baseURL` from config; verify the instance initializes with the
  expected options.
- [x] 3.2 Enable Google sign-in from configured credentials and treat Google
  emails as verified; verify the provider is present when credentials exist and
  that an unverified existing email is not silently linked.
- [x] 3.3 Implement `sendVerificationOTP` by calling the notification service
  with the internal token; verify a successful send, a generic delivery error on
  failure, and that the response never reveals account existence.
- [x] 3.4 Enable `requireEmailVerification` for password accounts; verify
  unverified sign-in is rejected and verified password sign-in succeeds.
- [x] 3.5 Verify email-code sign-in for a verified user and refusal to start a
  session for an unverified one, using handler-level tests.

## 4. Gateway auth proxy

- [x] 4.1 Mount a `/api/auth/*` proxy ahead of the versioned router that forwards
  method, body, and headers to the auth service; verify status, response headers,
  and `set-cookie` pass through unchanged.
- [x] 4.2 Verify a credentialed cross-origin request from the configured web
  origin is allowed and that the session cookie survives the round trip.
- [x] 4.3 Document the carve-out and the `/api/v1/auth` domain-only convention;
  verify the documented paths match the mounted routes.

## 5. Integration verification

- [x] 5.1 Run the auth, notification, and gateway test suites with no external
  services and confirm all pass; run each service build.
- [x] 5.2 Run the local end-to-end flow against MongoDB with the dev OTP log:
  register, read the code from the log, verify, call the session endpoint with
  the returned cookie, and sign out; confirm each response.
- [x] 5.3 Exercise the Google flow when credentials are available; if they are
  not, record the manual verification steps and skip the automated case explicitly.
