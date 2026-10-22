# Auth feature

Keep authentication-specific gateway API modules in `api/`, UI in `components/`,
and server-state hooks in `hooks/`. Use `stores/` only for local UI state, place
feature types in `types/`, and expose intentional public imports from `index.ts`.
TanStack Query owns remote auth data; do not mirror it into Zustand.
