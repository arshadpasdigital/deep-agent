# Design

## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- Vite + React 19 + TanStack Router/Query, Tailwind 4, shadcn `base-nova` tokens,
  Inter Variable, and only the `Button` primitive.
- `features/auth/` is a README. No Better Auth client is configured, and
  `better-auth` 1.7.14 is installed.
- `src/app/router.tsx` is code-based and currently registers only `/`.
- `src/lib/axios.ts` points at `http://localhost:8080`, the gateway.
- The archived `user-auth` capability provides `/api/auth/*` through the gateway:
  email/password, email OTP (verification and sign-in), Google, and cookie
  sessions with the Vite origin trusted.
- There is no frontend test runner configured (no Vitest/happy-dom); validation
  is `tsc`, ESLint, the Vite build, and live browser checks.

## Goals / Non-Goals

**Goals:**

- One `/auth` page that covers sign-in, sign-up, OTP, and Google end to end.
- A distinctive instrument-panel surface that still uses the project's tokens.
- Predictable error, pending, and success states with real session behavior.
- A repeatable design gate: render, score, redesign, re-score.

**Non-Goals:**

- Password reset, SMS, sign-out/profile surfaces, protected routes.
- A form library or a new test framework.
- Backend changes; the `user-auth` contract is fixed.

## Decisions

### One route, one state machine

`/auth` owns a small state machine:

```
mode: "signin" | "signup"
step: "form" | "otp"
otpPurpose: "signup" | "signin"
email: string        (preserved across steps)
```

Sign-up success and "email me a code" both move to `step: "otp"`. A successful
OTP verifies or signs in, then redirects to `/`. Switching modes clears errors and
password fields but keeps the email where it is useful. The route is registered in
`router.tsx`; no nested layout is introduced.

Alternative considered: separate `/login` and `/signup` routes. It doubles the
route and transition surface for no user benefit at this size.

### Better Auth React client is the only auth state source

Create a single client in `features/auth/api/client.ts`:

```ts
createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:8080",
  fetchOptions: { credentials: "include" },
  plugins: [emailOTPClient()],
})
```

- `useSession()` drives the route guard, the "already signed in" redirect, and
  post-auth refetch. Do not mirror the session into Zustand or a duplicate
  TanStack Query cache.
- Form submissions call `signIn.email`, `signUp.email`,
  `emailOtp.sendVerificationOtp`, `emailOtp.verifyEmail`, `signIn.emailOtp`, and
  `signIn.social`.
- `VITE_AUTH_BASE_URL` is the gateway origin, separate from any future
  `VITE_API_BASE_URL` that might include a version path.

Alternative considered: wrapping `getSession` in TanStack Query. It adds a cache
the auth client already owns and makes the OTP session-signal updates harder.

### Local form state, explicit validation, mapped server errors

A small `useAuthForm` hook holds values, field errors, and pending state. Client
validation covers required name, valid email, and the backend minimum password
length of eight. Server errors are mapped by code/message:

| Server signal | UI |
| --- | --- |
| invalid credentials | inline "Email or password is incorrect" |
| `EMAIL_NOT_VERIFIED` | move to OTP, purpose `signup` |
| `OTP_EXPIRED` | "That code expired. Send a new one." |
| `INVALID_OTP` | "That code doesn't match." |
| `TOO_MANY_ATTEMPTS` | stop verifying, require resend |
| 429 | "Too many requests. Try again in a minute." |
| network / 502 | "Can't reach the server. Check your connection and retry." |

No react-hook-form or zod: three fields and a six-digit code do not justify the
dependencies. The email is preserved on errors; passwords are cleared after a
failed sign-in.

### OTP field and resend behavior

Use `input-otp` for a six-slot field with paste, backspace, and keyboard support,
plus `autoComplete="one-time-code"` and `inputMode="numeric"`. Resend cooldown is
60 seconds, matching Better Auth's send rate-limit window; the button shows the
remaining time and re-enables after resend. After `TOO_MANY_ATTEMPTS`, resend is
the only way forward. "Use a password instead" returns to sign-in with the email.

Alternative considered: six controlled inputs by hand. It needs custom paste,
focus, and screen-reader handling that `input-otp` already provides.

### Instrument-panel visual system, scoped to the page

Add scoped tokens in `index.css` on `.auth-panel` so the rest of the app is
untouched:

| Token | Light | Dark |
| --- | --- | --- |
| surface | near-white graphite | deep graphite |
| ink / muted | near-black / gray | near-white / gray |
| line | hairline black at low alpha | hairline white at low alpha |
| accent | amber `oklch(~0.72 0.15 70)` | same accent, brighter |

- Layout: a centered panel, max width ~27rem, with a hairline outer frame and a
  top status row (`01 / ACCESS`, current mode, `SESSION: NONE`).
- Fields use a two-column label/input grid at `>= 640px` and stack on mobile.
- Mono face: JetBrains Mono (`@fontsource-variable/jetbrains-mono`) for eyebrows,
  labels, status, and the OTP digits; Inter stays for headings and helpers.
- One amber accent applied to the primary action and the active mode marker.
- Background: a subtle hairline grid inside the panel; no decorative fake data.
- Motion: 150-200 ms `ease-out` for mode/step changes and error entrance; no
  ambient loops; `prefers-reduced-motion` disables transforms.
- Dark mode uses the same structure with dark tokens; the panel is not forced
  dark in light mode.

### Session-aware routing without flashing

While `useSession` is pending, render the panel shell with a stable skeleton
(header and field placeholders), not the forms. When a session exists, render a
redirect to `/`. After any successful auth call, `refetch()` and navigate to `/`.
This keeps the "already signed in" and "success" paths identical.

### Verification and the design gate

No frontend test runner exists, so verification is:

1. `bun run typecheck`, `bun run lint`, `bun run build`.
2. Live stack: gateway + auth + notification + MongoDB, with the dev OTP in the
   notification log. Exercise sign-up → verify → session, password sign-in,
   email-code sign-in, Google (when configured), and the error states.
3. The design loop:

```
PLAN      invariants + state inventory
BUILD     real files; every state wired
RENDER    375 / 768 / 1440, light + dark, idle/pending/error/OTP/success
SCORE     clarity, hierarchy, state coverage, a11y, responsive,
          trust, consistency; pass = avg >= 4 and no dimension < 3
REDESIGN  only failing dimensions; max 3 rounds; re-render and re-score
```

Use `frontend-design` for direction, `web-design-engineer` for build and browser
acceptance, `better-ui`/`better-accessibility` for the polish pass, and
`interface-review` for the final diff review.

## Risks / Trade-offs

- [Risk] Cookie/CORS misconfiguration makes sign-in look successful but leaves no
  session → verify with a real browser session, not only rendered screenshots.
- [Risk] Client-side resend cooldown drifts from the server rate limit → use the
  same 60-second window and still handle a 429.
- [Risk] `useSession` flashes the forms on load → skeleton shell while pending.
- [Risk] Amber accent fails contrast in one theme → check both themes at the
  contrast threshold before accepting the pass.
- [Risk] Google credentials are absent locally → surface the provider error and
  keep password/OTP paths fully usable.
- [Risk] The new mono font and OTP dependency grow the bundle → both are small and
  used only by this feature; confirm the build output stays reasonable.

## Migration Plan

1. Add `VITE_AUTH_BASE_URL` handling, the auth client, and the two dependencies.
2. Register `/auth` and build the panel shell and tokens.
3. Implement the sign-in/sign-up forms and validation.
4. Implement the OTP step, resend cooldown, and attempt handling.
5. Add Google, session redirect, and error mapping.
6. Run the accessibility/responsive pass.
7. Run the design loop to the pass threshold, then typecheck/lint/build and the
   live end-to-end flow.
8. Rollback: remove the route and feature tree; no backend or data migration is
   involved.

## Open Questions

- Is "Deep Agent" the right product name in the panel, or should the copy use a
  different name?
- Should the page add a small "signed in as" / sign-out affordance after this
  change, or wait for the app shell?
