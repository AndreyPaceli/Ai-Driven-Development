# monorepo-bootstrap Specification

## Purpose

Provide a TurboRepo monorepo base containing a Next.js frontend and a NestJS backend under the `@poupig` namespace.

## Requirements

### Requirement: TurboRepo monorepo base

The system SHALL provide a TurboRepo monorepo containing a Next.js frontend and a NestJS backend, created via the `config-project` skill, using the `@poupig` namespace for all workspaces.

#### Scenario: Monorepo created with config-project skill

- **WHEN** the base project is bootstrapped using the `config-project` skill in the working directory
- **THEN** a TurboRepo structure exists with `apps/frontend` (Next.js) and `apps/backend` (NestJS)
- **AND** the backend has no internal git repository

#### Scenario: Namespace is @poupig

- **WHEN** the workspace package manifests are inspected
- **THEN** all workspace packages use the `@poupig` namespace (e.g. `@poupig/frontend`, `@poupig/backend`)

#### Scenario: Idempotent re-application

- **WHEN** the `config-project` skill is applied to an already-initialized project
- **THEN** the existing structure is reconciled without destructive overwrites
- **AND** Turbo `test`/`build` tasks remain standardized
