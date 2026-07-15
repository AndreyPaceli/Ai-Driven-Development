## Context

The Poupig repository currently contains only planning artifacts (`openspec/`, `.docs/`) — no application code. This change establishes the full project foundation end-to-end in five ordered steps, each driven by a dedicated skill. The steps are strictly sequential: each depends on the output of the previous one (e.g. the shared package must exist before the backend shared layer can reference `@poupig/shared`, which in turn is configured before Prisma).

Constraints provided by the request:

- Namespace MUST be `@poupig`.
- The prebuilt shared package comes from `.docs/prompts/shared.zip` and must end up as `@poupig/shared` under `packages/`.
- Docker and `.env` for Prisma MUST reference the `poupig` project.
- No Prisma migrations are run.
- Each step runs in its own subagent with clean context.

## Goals / Non-Goals

**Goals:**

- Bootstrap a TurboRepo monorepo (Next.js + NestJS) under `@poupig`.
- Import and validate the `@poupig/shared` package.
- Configure backend shared layer (centralized errors + cross-module code).
- Configure Prisma infrastructure (Docker + `.env` referencing `poupig`), without migrating.
- Configure frontend shared layer with common components.

**Non-Goals:**

- Running Prisma migrations or seeding real data.
- Creating any business/feature module.
- Implementing application features beyond scaffolding.

## Decisions

- **Skill-driven, one subagent per step.** Each step is delegated to a distinct subagent with clean context, invoking the prescribed skill (`config-project`, `config-shared-backend`, `config-prisma`, `config-shared-frontend`). Rationale: skills encode the deterministic, idempotent project standards; isolating context per step avoids cross-contamination and keeps each step auditable. Alternative considered: a single agent running all steps — rejected because accumulated context risks drift and the request explicitly asks for clean-context subagents.
- **Strict sequential ordering with dependency gating.** Step N starts only after step N−1 is verified complete. Rationale: later steps consume earlier outputs (the shared package, the namespace, the backend structure). Alternative: parallelization — rejected due to hard dependencies.
- **Shared package imported as a prebuilt artifact, not authored.** The package is extracted from `shared.zip` rather than scaffolded, then validated to be `@poupig/shared`. Rationale: it is a provided, fixed artifact; re-authoring would diverge from upstream.
- **Prisma configured but not migrated.** Docker Compose and `.env` reference `poupig` and `DATABASE_URL` is wired, but `prisma migrate` is intentionally skipped. Rationale: explicit request; migrations belong to later feature work and may depend on a running database.

## Risks / Trade-offs

- **Namespace mismatch after unzip** (shared package not named `@poupig/shared`) → Validate the extracted `package.json` `name` field as an explicit verification step before proceeding to the backend step.
- **Skill idempotency on re-runs** could overwrite prior work → Rely on the skills' idempotent behavior (`skills.config.json`) and reconcile rather than recreate; verify after each step.
- **Backend shared layer depends on `@poupig/shared`** being present and resolvable → Gate the backend step on successful workspace resolution of `@poupig/shared`.
- **Docker/`.env` drift from `poupig` naming** → Explicitly inspect Compose and `.env` for the `poupig` reference and `DATABASE_URL` compatibility after the Prisma step.
- **Unmigrated DB may confuse later steps** that assume a schema → Documented as intentional; no step in this change queries the database.

## Migration Plan

Not applicable — greenfield setup, no production data or rollback surface. If a step fails, the worktree can be reset and the corresponding skill re-applied (idempotent) before continuing.

## Open Questions

- None. All parameters (namespace, project name, no-migration constraint, asset location) are fixed by the request.
