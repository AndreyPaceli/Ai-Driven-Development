## 1. Monorepo Bootstrap (subagent, clean context)

- [x] 1.1 Invoke the `config-project` skill to bootstrap the TurboRepo monorepo in the working directory, using namespace `@poupig`
- [x] 1.2 Verify `apps/frontend` (Next.js) and `apps/backend` (NestJS) exist and the backend has no internal git repo
- [x] 1.3 Verify all workspace package manifests use the `@poupig` namespace and Turbo `test`/`build` tasks are standardized

## 2. Import Shared Package (subagent, clean context)

- [x] 2.1 Copy `.docs/prompts/shared.zip` and unzip it into `packages/`
- [x] 2.2 Verify a `packages/shared` directory exists with the extracted contents
- [x] 2.3 Verify the extracted `package.json` `name` is `@poupig/shared`
- [x] 2.4 Install workspace dependencies and verify `@poupig/shared` resolves as a workspace dependency

## 3. Backend Shared Layer (subagent, clean context)

- [x] 3.1 Invoke the `config-shared-backend` skill to (re)build `apps/backend/src/shared/` with centralized error handling and cross-module shared code
- [x] 3.2 Verify JWT auth (passport), guard, decorators, and English-named types are present
- [x] 3.3 Verify centralized error handling is compatible with the `@poupig/shared` error hierarchy
- [x] 3.4 Verify `AuthenticatedUser` was added to the `@poupig/shared` package

## 4. Prisma Setup (subagent, clean context)

- [x] 4.1 Invoke the `config-prisma` skill to configure modular Prisma schema, seed entrypoint, `prisma.config.ts`, `DbModule`, and `PrismaService` in the backend
- [x] 4.2 Ensure Docker Compose and `.env` reference the `poupig` project and `DATABASE_URL` is compatible with the Compose database
- [x] 4.3 Confirm NO Prisma migration is run and the schema is left unmigrated

## 5. Frontend Shared Layer (subagent, clean context)

- [x] 5.1 Invoke the `config-shared-frontend` skill to configure the `shared/` structure and Next.js route groups (public/private)
- [x] 5.2 Verify navigation lives in the private group layout (not in `shared/`)
- [x] 5.3 Verify common components (single menu, landing page, example auth screen, open dashboard) are installed and the dashboard is accessible without an auth block

## 6. Final Verification

- [x] 6.1 Confirm all five steps completed sequentially, each in a distinct clean-context subagent
- [x] 6.2 Run Turbo `build` to confirm the monorepo builds end-to-end (no migrations executed)
