# shared-package-import Specification

## Purpose

Import the prebuilt shared package into the monorepo `packages/` directory so apps can depend on `@poupig/shared`.

## Requirements

### Requirement: Import prebuilt shared package

The system SHALL import the prebuilt shared package by copying `.docs/prompts/shared.zip` and unzipping it into the `packages/` directory, producing a workspace whose namespace is `@poupig/shared`.

#### Scenario: Archive copied and extracted into packages

- **WHEN** the import step runs
- **THEN** `.docs/prompts/shared.zip` is copied and extracted inside `packages/`
- **AND** a `packages/shared` directory with the package contents exists

#### Scenario: Resulting namespace is @poupig/shared

- **WHEN** the extracted package's `package.json` is inspected
- **THEN** its `name` field is `@poupig/shared`

#### Scenario: Package resolvable in the workspace

- **WHEN** workspace dependencies are installed
- **THEN** `@poupig/shared` is resolvable as a workspace dependency by the apps
