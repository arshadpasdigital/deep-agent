# Frontend

React, TypeScript, and Vite application organized by application setup, shared
UI/utilities, and product features under `src/`.

## Ownership

- TanStack Query owns remote/server state, including query caching and mutation
  lifecycle. Avoid copying query responses into Zustand.
- Zustand is for local client/UI state, such as temporary selections or composer
  state.
- Feature API modules use the shared Axios client in `src/lib/axios.ts` and call
  the API gateway only. The browser must not call internal backend services.
- The AG-UI client/adapter belongs to `src/features/agents/api/ag-ui/` because
  it handles agent interaction.
- Shared shadcn primitives live in `src/components/ui/`; feature-specific UI
  stays with its feature.

## Source layout

- `src/app/`: application providers, Query client, router, and route components.
- `src/features/`: `auth`, `agents`, `conversations`, and `notifications`.
- `src/components/`: cross-feature UI, including shadcn primitives.
- `src/hooks/`: hooks shared across features; feature hooks stay in their feature.
- `src/lib/`: shared transport and general utilities.

The existing `@/*` alias points to `src/*`. Dependencies are managed by this
frontend project; no root/backend package manifest is used for frontend code.
