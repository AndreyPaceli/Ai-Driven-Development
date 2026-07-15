# backend-shared-layer Specification

## Purpose

Provide the NestJS backend shared layer with centralized error handling and authentication primitives shared across modules.

## Requirements

### Requirement: NestJS backend shared layer

The system SHALL configure the NestJS backend shared layer at `apps/backend/src/shared/` via the `config-shared-backend` skill, enabling centralized error handling and code shared across modules.

#### Scenario: Shared layer rebuilt deterministically

- **WHEN** the `config-shared-backend` skill is applied
- **THEN** `apps/backend/src/shared/` is (re)built with centralized error handling
- **AND** the shared code is available for use across backend modules

#### Scenario: Compatible with @poupig/shared error hierarchy

- **WHEN** the backend handles a domain error
- **THEN** the centralized error handling maps it consistently using the `@poupig/shared` error hierarchy

#### Scenario: Authentication primitives present

- **WHEN** the shared layer is inspected
- **THEN** JWT-based authentication (passport), a guard, decorators, and English-named types are present
- **AND** `AuthenticatedUser` is added to the `@poupig/shared` package
