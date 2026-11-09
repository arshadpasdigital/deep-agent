# Tasks

## 1. Client, dependencies, and route

- [x] 1.1 Add `input-otp` and `@fontsource-variable/jetbrains-mono`, and add the
  shadcn input, label, field, alert, and separator primitives; verify the imports
  resolve and the app builds.
- [ ] 1.2 Create the Better Auth client in `features/auth/api/client.ts` using
  `createAuthClient` from `better-auth/react`, the `emailOTPClient` plugin, the
  gateway origin from `VITE_AUTH_BASE_URL`, and `credentials: "include"`; verify
  `bun run typecheck` passes and the client type exposes the OTP and social calls.
- [ ] 1.3 Register `/auth` in `router.tsx` with a session-aware guard: pending
  shows the panel skeleton, signed-in redirects to `/`; verify navigating to
  `/auth` signed out shows the page without a form flash.

## 2. Panel shell and visual system

- [ ] 2.1 Add scoped `.auth-panel` tokens (surface, ink, muted, line, amber
  accent), JetBrains Mono, the hairline grid, and the centered framed layout;
  verify at 375, 768, and 1440 in light and dark with no horizontal scroll.
- [ ] 2.2 Build the status header (`01 / ACCESS`, current mode, session state),
  the mode switch, and the single-primary-action rule; verify keyboard focus order
  and that secondary actions are visually subordinate.

## 3. Sign-in and sign-up forms

- [ ] 3.1 Implement the sign-in form with email/password validation, pending
  state, password clearing on failure, and mapped errors; verify invalid
  credentials, network failure, and pending behavior.
- [ ] 3.2 Implement the unverified-email transition: a `EMAIL_NOT_VERIFIED`
  response moves to the OTP step with the submitted email; verify no sign-in
  session is created and the message is shown.
- [ ] 3.3 Implement sign-up (name/email/password), client validation, and the
  generic existing-account acknowledgement; verify valid input reaches OTP and
  invalid email/short password show field errors without a request.

## 4. OTP step

- [ ] 4.1 Build the six-slot OTP field with paste, backspace, keyboard support,
  `inputMode="numeric"`, and `autoComplete="one-time-code"`; verify pasting and
  clearing set the submitted value correctly.
- [ ] 4.2 Implement verify for both purposes (signup verification and email-code
  sign-in); verify a correct code establishes a session and redirects.
- [ ] 4.3 Implement resend: 60-second cooldown with remaining time, re-enable
  after cooldown, and resend as the only path after `TOO_MANY_ATTEMPTS`; verify
  the expiry and attempt error messages.
- [ ] 4.4 Implement "use a password instead" returning to sign-in with the email
  preserved and the code state cleared.

## 5. Google, session, and failure surfaces

- [ ] 5.1 Add "Continue with Google" using `signIn.social({ provider: "google",
  callbackURL: "/" })`; verify the success redirect when credentials exist and the
  in-panel error when they do not, with other methods still usable.
- [ ] 5.2 Wire `useSession` as the source of truth: already-signed-in redirect,
  post-auth refetch, and navigation to `/`; verify both paths in a real browser.
- [ ] 5.3 Implement the network/502 and rate-limit error surfaces with preserved
  input and a retry action; verify with the gateway stopped and with a forced 429.

## 6. Accessibility and responsive pass

- [ ] 6.1 Add labels, `aria-live` errors, first-invalid-field focus, visible focus
  rings, and reduced-motion handling; verify keyboard-only completion of sign-in
  and OTP.
- [ ] 6.2 Verify 375/768/1440 and light/dark: no overflow, readable measure,
  contrast at the threshold, and the panel not forced dark in light mode.

## 7. Design gate

- [ ] 7.1 Plan the direction and state inventory, build the page, then render
  screenshots at 375/768/1440 in light and dark for idle, pending, error, OTP, and
  success; record the evidence set.
- [ ] 7.2 Score clarity, hierarchy, state coverage, accessibility, responsive
  behavior, trust, and consistency on a 1-5 scale; pass requires avg >= 4 and no
  dimension < 3.
- [ ] 7.3 Redesign only the failing dimensions and re-render/re-score, for up to
  three rounds; verify the final pass records the scores and the winning screens.

## 8. Verification

- [ ] 8.1 Run `bun run typecheck`, `bun run lint`, and `bun run build`; confirm all
  pass and the new dependencies appear in the build output.
- [ ] 8.2 Run the local stack (gateway, auth, notification, MongoDB) with the dev
  OTP log and complete in the browser: sign-up, read the code from the log, verify,
  reach `/`, sign out, sign in with password, and sign in with a code.
- [ ] 8.3 If Google credentials are unavailable, record the manual steps and skip
  the automated provider case explicitly; otherwise complete the consent flow.
