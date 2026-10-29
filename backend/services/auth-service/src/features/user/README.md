# User feature

Reads the `user` collection that Better Auth owns in MongoDB.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users/session` | Current Better Auth session plus user |
| GET | `/api/v1/users/me` | Current authenticated user |
| GET | `/api/v1/users/:id` | User by id |

Better Auth's own endpoints (sign-up, sign-in, sign-out, etc.) stay on
`/api/auth/*` and are mounted directly from `bootstrap/auth.ts`.
