# Authentication feature

Better Auth owns identity: sign-up, sign-in, sign-out, sessions, and the
`user` / `session` / `account` MongoDB collections.

- `bootstrap/auth.ts` creates the Better Auth instance through the
  `AuthProvider` singleton.
- `main.ts` mounts `toNodeHandler(auth)` on `/api/auth/*` before the JSON body
  parser, which matches the gateway's `/api/auth` upstream prefix.
- User-facing reads live in `features/user`.
