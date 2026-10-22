# Design

## Context

The frontend is a Vite application using React and TypeScript. Its dependencies already include TanStack Router and Query, AG-UI, Axios, Zustand, and shadcn/ui. The current `src/` is a starter layout with `App.tsx`, `main.tsx`, shared UI, a theme provider, and utilities. See `proposal.md` for motivation and scope.

## Goals / Non-Goals

**Goals:**

- Place application wiring and providers in one predictable area.
- Keep feature code together by product capability.
- Make the distinction between remote server state and local UI state explicit.
- Keep shared UI primitives and transport utilities reusable across features.
- Preserve the current stack, alias configuration, and starter behavior while relocating files.

**Non-Goals:**

- Implementing authentication, agent workflows, conversation persistence, or notifications.
- Adding dependencies or changing the frontend package manifest.
- Introducing a monorepo, a global state layer for server data, or file-based route generation.

## Decisions

### Application wiring and routing

Use `src/app/` for the application shell, provider composition, Query client, and router. TanStack Router will use code-based route definitions in `app/router.tsx`; the current Vite configuration does not enable a file-route plugin or generated route tree, and code-based routing avoids adding that configuration as part of a folder-organization change.

`main.tsx` remains the browser entry point and imports the global `index.css`. The existing starter `App.tsx` moves under `app/` and becomes the router/provider composition point. The current theme provider remains a shared component and is wired through the application providers.

### Feature-based organization

Each feature owns its API calls, feature components, hooks, local store, types, and public exports as those files become necessary:

```text
src/features/<feature>/
├── api/
├── components/
├── hooks/
├── stores/
├── types/
└── index.ts
```

Initial feature boundaries are `auth`, `agents`, `conversations`, and `notifications`. A feature creates only the subfolders it uses; the structure is a convention, not a requirement to add empty files. The AG-UI client or adapter belongs to the agents feature because it implements agent interaction. Feature-specific API functions and TanStack Query hooks remain beside their feature.

### State and data access

TanStack Query owns remote state, including API query caching, loading/error state, and mutation lifecycle. Zustand is reserved for local client state such as temporary UI selections or composer state. Do not mirror query responses into Zustand by default.

`src/lib/axios.ts` owns the shared Axios instance and cross-cutting HTTP defaults. Feature `api/` modules use that instance to call the gateway API. They do not call internal backend service URLs directly. TanStack Query hooks wrap those feature API functions.

### Shared components and utilities

Keep shadcn primitives under `src/components/ui/`, matching the existing `components.json` aliases. Put cross-feature layout elements under `src/components/layout/`, and place genuinely cross-feature hooks under `src/hooks/`. Keep general non-domain helpers in `src/lib/`; domain-specific helpers stay in their feature.

### Expected layout

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   ├── query-client.ts
│   └── router.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   └── theme-provider.tsx
├── features/
│   ├── auth/
│   ├── agents/
│   ├── conversations/
│   └── notifications/
├── hooks/
├── lib/
│   ├── axios.ts
│   └── utils.ts
├── index.css
└── main.tsx
```

The feature directories gain `api/`, `components/`, `hooks/`, `stores/`, and `types/` as needed. The existing `@/*` alias already resolves to `src/*`, so imports can keep using that convention. `index.css`, shadcn components, and current package dependencies remain in place.

## Risks / Trade-offs

- [Risk] A feature-first layout can create many tiny files before behavior exists -> create only files needed by a feature and keep placeholders limited to the agreed scaffold.
- [Risk] Zustand may become a second cache for API data -> document and follow the rule that TanStack Query owns remote state.
- [Risk] Route definitions may grow in one file -> keep the root router as the assembly point and move route components into their owning feature.
- [Risk] Moving the starter app can break imports -> update entry imports and run the existing typecheck/build/lint commands after the move.
