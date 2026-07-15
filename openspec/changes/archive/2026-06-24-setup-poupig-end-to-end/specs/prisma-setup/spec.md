## ADDED Requirements

### Requirement: Prisma backend infrastructure

The system SHALL configure Prisma in the NestJS backend via the `config-prisma` skill, with Docker Compose and `.env` files referencing the `poupig` project, and SHALL NOT run any migration as part of this configuration.

#### Scenario: Prisma infrastructure initialized

- **WHEN** the `config-prisma` skill is applied
- **THEN** the modular Prisma schema, seed entrypoint, `prisma.config.ts`, `DbModule`, and `PrismaService` are configured in the backend

#### Scenario: Docker and .env reference poupig

- **WHEN** the Docker Compose and `.env` files are inspected
- **THEN** the database/service configuration references the `poupig` project
- **AND** `DATABASE_URL` in `.env` is compatible with the Docker Compose database

#### Scenario: No migration is executed

- **WHEN** the Prisma configuration completes
- **THEN** no Prisma migration is run
- **AND** the database schema is left unmigrated
