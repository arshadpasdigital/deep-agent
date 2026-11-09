# Authentication feature

Better Auth owns identity: sign-up, sign-in, sign-out, sessions, and the
`user` / `session` / `account` MongoDB collections.

- `bootstrap/auth.ts` creates the Better Auth instance through the
  `AuthProvider` singleton.
- `main.ts` mounts `toNodeHandler(auth)` on `/api/auth/*` before the JSON body
  parser, which matches the gateway's `/api/auth` upstream prefix.
- User-facing reads live in `features/user`.

## Google sign-in verification

Google credentials were not available in the implementation environment, so the
consent flow was not exercised automatically. Verify it manually:

1. Create a Google OAuth client and register the redirect URI
   `${BETTER_AUTH_URL}/api/auth/callback/google`.
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for the auth service, and
   keep `BETTER_AUTH_URL` on the gateway origin.
3. Start the stack and complete "Continue with Google" from the web app.
4. Confirm the callback sets a session cookie and the returned user has
   `emailVerified: true`.
5. Confirm an existing verified email signs into the same account, and an
   existing unverified email is not silently linked.
