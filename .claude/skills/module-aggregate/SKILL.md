---
name: module-aggregate
description: Creates the standard scaffold for an aggregate inside an existing business module in `modules/<module>`, always generating English folder and file names such as `model`, `provider`, `use-case`, `*.entity.ts`, `*.repository.ts`, and `*.use-case.ts`.
---

# Module Aggregate

Use `scripts/create-aggregate.js` to create the deterministic base scaffold for an aggregate inside an existing module in `modules/<module>`. The generated structure must always use English naming for folders, files, classes, interfaces, and use cases.

Important: the skill may keep internal test templates under `.claude/skills/module-aggregate/assets/**`, but the generated test files must always be created at the module root under `modules/<module>/test/**`, never inside `modules/<module>/src/**`.

## Required inputs

1. `module name`, matching an existing folder in `modules/<module>`.
2. `aggregate name`.

## Optional but recommended input

3. `initial use-case scaffold mode`:
   - `crud`
   - `example`

If the request does not include this third input, stop and ask one objective question:

`Deseja criar a base de use cases em "crud" ou "example"?`

Do not execute the skill without that answer.

## Workflow

1. Validate that the request explicitly provides the module and aggregate.
2. Validate that `modules/<module>` already exists and contains `src/index.ts`.
3. Normalize the aggregate name to `kebab-case` for folders and files.
4. If `mode` is missing, ask the objective question above and wait.
5. Execute from the project root:

```bash
node .claude/skills/module-aggregate/scripts/create-aggregate.js --module auth --aggregate user --mode crud
```

6. Verify at the end:
   - `modules/<module>/src/<aggregate>/dto/<aggregate>.dto.ts`
   - `modules/<module>/src/<aggregate>/model/<aggregate>.entity.ts`
   - `modules/<module>/src/<aggregate>/provider/<aggregate>.repository.ts`
   - `modules/<module>/src/<aggregate>/use-case/index.ts`
   - `modules/<module>/src/<aggregate>/index.ts`
   - `modules/<module>/test/mock/in-memory-<aggregate>.repository.ts`
   - `modules/<module>/test/<aggregate>/*.use-case.test.ts`
   - `modules/<module>/src/index.ts` exports `./<aggregate>` without removing existing exports

## What the skill creates

- Aggregate scaffold under `modules/<module>/src/<aggregate>/`
- Folders `model`, `provider`, and `use-case`
- A base entity extending `Entity<Type, Props>` from the shared package resolved from `packages/shared/package.json`
- An initial repository contract extending `CrudRepository<Entity>` inside `provider/`
- A fully functional in-memory repository implementation inside `modules/<module>/test/<aggregate>/mock/`, intended as the reference implementation for use-case tests
- Use-case tests under `modules/<module>/test/<aggregate>/`, already wired to consume the in-memory repository mock
- No `test` folder is generated inside `src/<aggregate>`; production code stays under `src/**` and test-only artifacts stay under `test/**`
- Required `index.ts` files to export the aggregate
- Minimal use cases for the selected mode, implementing `UseCase<IN, OUT>` and returning `Result<OUT>`

## Naming conventions

- Folders in English and `kebab-case`: `model`, `provider`, `use-case`.
- Files in `kebab-case`, with English suffixes:
  - Entity: `<aggregate>.entity.ts`
  - Repository contract: `<aggregate>.repository.ts`
  - In-memory test repository implementation: `test/mock/in-memory-<aggregate>.repository.ts`
  - Use case: `<verb>-<aggregate>.use-case.ts`
  - Use-case test: `test/<aggregate>/<verb>-<aggregate>.use-case.test.ts`
- Entity class in `PascalCase` from the aggregate name (`User`).
- Repository interface as `<PascalCaseAggregate>Repository` (`UserRepository`).
- In-memory test repository implementation as `InMemory<PascalCaseAggregate>Repository` (`InMemoryUserRepository`).
- Use cases with English verbs: `Create`, `Update`, `Delete`, `FindById`.

## Use-case modes

### `crud`

Creates the standard base:

- `create-<aggregate>.use-case.ts`
- `update-<aggregate>.use-case.ts`
- `delete-<aggregate>.use-case.ts`
- `find-<aggregate>-by-id.use-case.ts`
- `test/<aggregate>/create-<aggregate>.use-case.test.ts`
- `test/<aggregate>/update-<aggregate>.use-case.test.ts`
- `test/<aggregate>/delete-<aggregate>.use-case.test.ts`
- `test/<aggregate>/find-<aggregate>-by-id.use-case.test.ts`

### `example`

Creates only one minimal generic use case to demonstrate the structure:

- `create-<aggregate>.use-case.ts`
- `test/<aggregate>/create-<aggregate>.use-case.test.ts`

## Mandatory conventions

- Do not implement real business rules.
- Do not invent aggregate-specific attributes.
- Do not assume an opinionated DDD approach beyond the aggregate organization already used in the project.
- Do not create controllers, adapters, Prisma implementations, migrations, or any extra infrastructure.
- Preserve existing exports in `modules/<module>/src/index.ts`.
- Always import from the shared package resolved from `packages/shared/package.json`; never use relative paths into `packages/shared`.
- Keep the production source tree free of in-memory repository implementations; place them only under `modules/<module>/test/<aggregate>/mock/`.
- Generate use-case tests that depend on the test mock implementation, not on files inside `src/<aggregate>/provider/`.
- Use only the resources contained in `.claude/skills/module-aggregate`.

## Internal resources

- `scripts/create-aggregate.js`: materializes the aggregate scaffold.
- `assets/common/`: base templates for `model`, `provider`, `aggregate`, `use-case`, and shared test mocks.
- The internal template folders `assets/common/test/**` and `assets/test/**` are only sources for generation; their output target is always `modules/<module>/test/**`.
- `assets/use-case/crud/`: CRUD use-case templates in English.
- `assets/use-case/example/`: minimal example use-case template.
- `assets/test/crud/`: CRUD use-case test templates in English.
- `assets/test/example/`: minimal example use-case test template.

## Guardrails

- Do not execute when the requested module does not exist.
- Do not execute when the aggregate already exists.
- Do not infer `crud` or `example` if the mode was not provided.
- Do not generate in-memory repositories inside `modules/<module>/src/**`.
- Do not edit files outside `modules/<module>/src/**` and `modules/<module>/test/**`, except the skill itself.
- Do not add extra documentation outside the skill files.
