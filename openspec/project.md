# Poupig — Project Context

Contexto de projeto para o OpenSpec e para agentes de IA. Descreve o domínio, a
stack e as convenções reais do Poupig para embasar `proposal`, `design`, `specs`
e `tasks`.

## Purpose / Domain

Poupig é uma aplicação de **finanças pessoais** ("poupar" → economizar). O
objetivo é ajudar o usuário a organizar e acompanhar suas finanças (contas,
categorias, lançamentos/recorrências, orçamentos). O produto é um monorepo
full-stack com API (NestJS) e web (Next.js), guiado por desenvolvimento
orientado a especificação (OpenSpec) e por skills de scaffolding.

> Estado atual: apenas a **fundação** está pronta (monorepo, pacote `shared`,
> camadas compartilhadas de back e front, Prisma configurado sem migrations).
> Ainda **não há módulos de negócio** implementados. A próxima feature planejada
> é **registro de usuário / auth** (ver `.docs/prompts/02-auth-registrar-usuario.md`).

## Monorepo Layout

```
poupig/
├── apps/
│   ├── backend/     # NestJS 11 (API, Prisma, JWT auth, camada shared)
│   └── frontend/    # Next.js 16 + React 19 (App Router, Tailwind v4, Radix)
├── packages/
│   ├── shared/      # @poupig/shared — núcleo de domínio compartilhado (TS puro)
│   ├── eslint-config/
│   └── typescript-config/
├── modules/         # (vazio) módulos de negócio (packages @poupig/*) — DDD
├── openspec/        # specs, changes, contexto (este arquivo)
└── .docs/           # prompts e desenhos (excalidraw) de planejamento
```

- Gerenciado por **TurboRepo** + **npm workspaces** (`apps/*`, `packages/*`,
  `modules/*`, `packages/config/*`). Namespace: `@poupig`.
- `modules/*` é onde vivem os packages de domínio (ainda a criar via skills).

## Tech Stack (versões reais)

| Camada    | Tecnologia                                                        |
| --------- | ----------------------------------------------------------------- |
| Runtime   | Node >= 18, npm 10.9.2, TypeScript 5.x                            |
| Build     | TurboRepo 2.x (`turbo run build/dev/lint/test/check-types`)      |
| Backend   | NestJS 11, Passport + JWT (`@nestjs/jwt`, `passport-jwt`)         |
| ORM/DB    | Prisma 7, PostgreSQL (via Docker Compose), `@prisma/adapter-pg`  |
| Frontend  | Next.js 16 (App Router), React 19, Tailwind CSS v4               |
| UI        | Radix UI, `class-variance-authority`, `lucide-react`, `recharts` |
| Forms     | `react-hook-form` + validador compartilhado do front (`v`)        |
| Testes    | Jest 30 (backend e shared); e2e com supertest                    |

> Atenção Next.js: a versão em uso tem breaking changes; consultar
> `node_modules/next/dist/docs/` antes de escrever código de front (ver
> `apps/frontend/AGENTS.md`).

## Architecture & Conventions

### Regras gerais

- **Nomes em inglês** para pastas, arquivos e símbolos de código (folders/files
  como `model`, `use-case`, `provider`, `*.entity.ts`, `*.repository.ts`).
  Textos de produto/domínio voltados ao usuário podem ser PT-BR.
- **Padrão `Result`** (de `@poupig/shared`) para validação e erros de domínio —
  o núcleo de domínio **não lança exceções**; retorna `Result` (ok/erro). A
  conversão para exceções HTTP acontece só na borda (controllers).
- **DDD / camadas**: domínio puro em `modules/*` e `packages/shared`;
  infraestrutura (Prisma, Nest) nos `apps/*`. O domínio não depende de framework.
- **CQRS de leitura**: escrita via `*.repository.ts` (comandos sobre entidades);
  leitura via `*.query.ts` + DTOs de projeção (`find-*` use cases).

### Núcleo compartilhado — `@poupig/shared`

Blocos base reutilizáveis (TS puro, sem framework):

- `base/`: `Entity`, `ValueObject` (`vo`), `Result`, `ResultValidator`,
  `UseCase`, `ValidationError`, `Optional`, `Metadata`, `Message`.
- `db/`: contratos genéricos de repositório (`CrudRepository`, `CreateRepository`,
  `UpdateRepository`, `DeleteRepository`, `FindByIdRepository`) e
  `TransactionManager` (`runInTransaction`).
- `query/`: `PaginationDTO`.
- `dto/`: `AuthenticatedUser`.
- `vo/`: Value Objects prontos — `email`, `cpf`, `person-name`, `password`,
  `strong-password`, `hash-password`, `encrypted-password`, `id`, `alias`,
  `description`, `short-description`, `text`, `url`, `hex-color`, `date-only`,
  `day-of-month`, `duration`, `non-negative`, `positive-integer`.

Reutilize esses VOs/bases antes de criar novos.

### Módulos de negócio — `modules/<module>` (via skills)

Cada módulo é um package `@poupig/*` com aggregates. Estrutura padrão por
aggregate (skill `module-aggregate`): `model/` (`*.entity.ts`,
`*.repository.ts`), `use-case/` (`*.use-case.ts`), `provider/`, `dto/`
(`*.dto.ts` — `InDTO`/`OutDTO`), queries (`*.query.ts`), value objects
(`*.vo.ts`) e domain services (`*.service.ts`). Sempre com testes.

### Backend — `apps/backend` (NestJS)

- Controllers no "padrão Genérico" (`*.controller.ts`): definem rotas/verbos,
  aplicam guards/permissões, fazem binding de `@Body/@Param/@Query`, orquestram
  use cases e **mapeiam falhas de `Result` para exceções HTTP** (`BadRequestException`,
  `NotFoundException`, etc.).
- Camada `src/shared/`: tratamento centralizado de erros (`api-exception.filter`),
  auth JWT (`jwt.strategy`, `jwt.guard`), decorators (`@CurrentUser`, `@Public`),
  tipos (`AuthenticatedRequest`, `JwtPayload`). Compatível com a hierarquia de
  erros de `@poupig/shared`.
- Persistência: `src/db/` (`PrismaService`, `DbModule`) compatível com
  `TransactionManager`/`runInTransaction`.

### Prisma / Banco

- Schema **modular por domínio**: `apps/backend/prisma/models/*.model.prisma`
  (agregados via `prisma-merge`), entrypoint em `prisma/schema.prisma`.
- Seed **técnico** em `prisma/seed/main.ts` (sem seeds de módulos).
- `DATABASE_URL` (em `apps/backend/.env`) referencia o projeto `poupig`; Postgres
  sobe via `docker compose up -d postgres` (script `db:start`).
- **Migrations não são executadas automaticamente** — rodar manualmente quando o
  domínio exigir (`prisma:migrate:dev`).

### Frontend — `apps/frontend` (Next.js)

- App Router com grupos de rota `(public)` e `(private)`. A navegação/menu vive
  no layout do grupo `(private)`, **não** em `shared/` (rotas são estado da app).
- Componentes comuns em `src/shared/components/ui/*` (base Radix + Tailwind) e
  `src/shared/components/form/*`.
- Forms: `react-hook-form` + schemas em
  `src/modules/<domain>/data/*.schema.ts` usando o validador `v` e tipagem via
  `v.infer`. Erros integrados aos componentes de form compartilhados.

## Tooling & Workflow

- **OpenSpec** (`schema: spec-driven`) dirige o trabalho: `/opsx:explore` para
  pensar, `/opsx:propose` para criar uma change, `/opsx:apply` para implementar,
  `/opsx:archive` para consolidar. Specs vivem em `openspec/specs/`.
- **Skills** de scaffolding em `.claude/skills/` — preferir sempre a skill
  indicada para cada tipo de artefato (config-*, module-*, backend-*,
  frontend-form-schema, etc.).
- Scripts raiz (turbo): `npm run build | dev | lint | test | check-types |
  format`.
- **Commits**: mensagens curtas e descritivas (estilo conventional commits:
  `feat:`, `chore:`, `fix:` ...).

## Constraints / Non-goals

- Não introduzir dependência de framework no núcleo de domínio (`modules/*`,
  `packages/shared`).
- Não lançar exceções no domínio — usar `Result`.
- Não rodar migrations automaticamente durante scaffolding.
- Não commitar segredos: `.env` é ignorado; versionar apenas `.env.example`.
