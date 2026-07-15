## Why

The Poupig project has no codebase yet — only planning artifacts exist. Before any feature work can begin, the monorepo, shared package, backend/frontend shared layers, and database infrastructure must be configured in a consistent, reproducible way. This change establishes that foundation end-to-end so subsequent module work starts from a known-good baseline.

## What Changes

- Bootstrap a TurboRepo monorepo with a Next.js frontend and a NestJS backend using the `config-project` skill, under the `@poupig` namespace.
- Import the prebuilt `shared` package: copy `.docs/prompts/shared.zip`, unzip it into `packages/`, and confirm the resulting namespace is `@poupig/shared`.
- Configure the NestJS backend shared layer with the `config-shared-backend` skill: centralized error handling and code shared across modules, compatible with the `@poupig/shared` error hierarchy.
- Configure Prisma in the backend with the `config-prisma` skill, ensuring Docker Compose and `.env` reference the `poupig` project. **No migrations are run.**
- Configure the Next.js/React frontend shared layer with the `config-shared-frontend` skill, installing the common components.
- Each step runs in a distinct subagent with clean context, sequentially, where each step depends on the completion of the previous one.

## Capabilities

### New Capabilities

- `monorepo-bootstrap`: TurboRepo base with Next.js frontend and NestJS backend under the `@poupig` namespace.
- `shared-package-import`: Importing and validating the prebuilt `@poupig/shared` package into `packages/`.
- `backend-shared-layer`: NestJS centralized error handling and cross-module shared code.
- `prisma-setup`: Prisma infrastructure with Docker/`.env` referencing `poupig`, without running migrations.
- `frontend-shared-layer`: Next.js/React shared structure and common components.

### Modified Capabilities

<!-- None — greenfield project, no existing specs. -->

## Impact

- **New directories/files**: `apps/frontend` (Next.js), `apps/backend` (NestJS), `packages/shared`, Prisma schema/config, Docker Compose, and `.env` files.
- **Dependencies**: TurboRepo, Next.js, NestJS, Prisma, Docker.
- **Tooling/skills**: `config-project`, `config-shared-backend`, `config-prisma`, `config-shared-frontend`.
- **Execution model**: sequential, one subagent per step with clean context.
- **Out of scope**: no Prisma migrations executed; no feature modules created.
