# Tasks

## 1. Establish the application shell

- [x] 1.1 Move the starter `App.tsx` into `src/app/App.tsx` and add the code-based TanStack Router tree; verify the starter screen remains reachable through the root route.
- [x] 1.2 Add `src/app/query-client.ts` and `src/app/providers.tsx`, then wire the Query and existing theme providers; verify the app mounts with each provider initialized once.
- [x] 1.3 Keep `src/main.tsx` as the Vite entry point and preserve the global stylesheet; verify the `@/*` alias resolves application and shared component imports.

## 2. Define feature-based frontend ownership

- [x] 2.1 Add feature roots for `auth`, `agents`, `conversations`, and `notifications`, with concise README files documenting where feature API modules, components, hooks, Zustand stores, types, and exports belong; verify no business behavior is invented by the scaffold.
- [x] 2.2 Document the state and client ownership conventions in `frontend/README.md`: TanStack Query owns remote state, Zustand owns local UI state, Axios calls the gateway, and AG-UI belongs to the agents feature; verify the documentation matches the design.
- [x] 2.3 Add the shared Axios client under `src/lib/axios.ts` and reserve the AG-UI adapter location inside `features/agents`; verify the Axios base URL points to the gateway and no internal service URL appears in frontend configuration.

## 3. Preserve and connect shared frontend code

- [x] 3.1 Keep shadcn primitives under `src/components/ui/`, retain the theme provider under shared components, and create `src/components/layout/`, `src/hooks/`, and shared `src/lib/` locations as needed; verify existing component and utility imports continue to resolve.
- [x] 3.2 Update imports and application wiring after the moves; verify the existing frontend typecheck, lint, and production build commands succeed without changing dependencies.
