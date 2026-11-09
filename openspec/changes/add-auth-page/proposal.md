# Proposal

## Why

The backend auth vertical is implemented and archived (`user-auth`), but the
frontend has no auth surface at all: no `/auth` route, no Better Auth client, and
only a `Button` primitive. Users cannot create an account, verify their email,
sign in, or reach a session. This change adds the single page that exercises that
contract and gives the product a distinctive entry point.

## What Changes

- Add a `/auth` route with a sign-in/sign-up mode switch and an in-panel OTP step.
- Configure the Better Auth React client against the gateway origin with
  credentials, and read the session through `useSession()`.
- Implement sign-in (email/password and Google), sign-up with email
  verification, email-code sign-in, and OTP resend/attempt handling.
- Map Better Auth errors to human copy and cover idle, pending, field error,
  server error, rate-limited, network, and success states.
- Redirect signed-in visitors to `/` and redirect to `/` after successful
  authentication.
- Establish the instrument-panel visual direction: scoped graphite surface,
  hairline grid, mono labels, one amber accent, and a single primary action per
  state. Add the missing shadcn primitives, an OTP input, and a mono face.
- Add the design quality loop (plan, build, render at three widths in light and
  dark, score, redesign failing dimensions, re-score), plus typecheck, lint,
  build, and a live end-to-end verification.

Out of scope: password reset, SMS OTP, sign-out/profile surfaces, a protected app
shell, and any backend change.

## Capabilities

### New Capabilities

- `auth-page`: The browser authentication surface: route and modes, credential
  and Google flows, OTP step and resend behavior, session-aware redirects, error
  and loading states, accessibility, and responsive behavior.

### Modified Capabilities

None. `user-auth` already defines the backend contract; this change consumes it
without changing its requirements.

## Impact

- **Code**: `frontend/src/app/router.tsx`, a new
  `frontend/src/features/auth/**` tree, `frontend/src/components/ui/**`, and
  `frontend/src/index.css` for scoped auth tokens and the mono face.
- **Dependencies**: `better-auth` client plugins (already installed),
  `input-otp` for the code field, and a variable mono font; plus the shadcn
  input/label/field/alert/separator primitives.
- **Configuration**: a gateway-origin base URL for the auth client, defaulting to
  `http://localhost:8080`.
- **Behavior**: the gateway must allow the Vite origin with credentials, which the
  archived auth change already configures.
- **Risk**: cookie/CORS misconfiguration can make sessions fail silently; the
  design loop and the live end-to-end check must exercise a real session, not
  just rendered states.
