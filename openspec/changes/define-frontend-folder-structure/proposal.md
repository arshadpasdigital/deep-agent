# Proposal

## Why

The frontend already has React, TypeScript, Vite, TanStack Router and Query, AG-UI, Axios, Zustand, and shadcn/ui, but its source is still organized as a starter screen with shared components and utilities. A feature-based layout will give upcoming agent, conversation, authentication, and notification work clear ownership without changing the user-facing behavior or adding dependencies.

## What Changes

- Define an application layer for router setup, providers, and the TanStack Query client.
- Organize product code into feature folders for authentication, agents, conversations, and notifications.
- Define where feature API calls, hooks, components, types, and feature-local Zustand stores belong.
- Define shared locations for shadcn/ui components, layout components, Axios and AG-UI clients, and general utilities.
- Define state ownership: TanStack Query for remote/server state and Zustand for local UI/client state.
- Preserve the existing Vite, React, TypeScript, Tailwind, and shadcn setup; do not add dependencies or implement feature behavior in this change.

## Capabilities

### New Capabilities

None. This change organizes existing frontend code and does not introduce user-visible behavior.

### Modified Capabilities

None.

This is a structure-only refactor. The change explicitly opts out of spec deltas with `skip_specs: true` in `.openspec.yaml`.

## Impact

- Affects the `frontend/src/` folder layout and import locations.
- Moves the starter `App` into the application layer while preserving the existing theme provider, shadcn UI component, and utility locations.
- Uses dependencies already declared in `frontend/package.json`; no package installation or manifest changes are required.
