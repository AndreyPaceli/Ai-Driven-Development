# Module Template Contract

## Goal

Gerar um módulo novo de forma determinística em três áreas do monorepo:

- domain package: `modules/<module-name>`
- backend: `<backendAppPath>/src/modules/<module-name>` + `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- frontend: `<frontendAppPath>/src/modules/<module-name>` + rota em `<frontendAppPath>/src/app/(private)/<module-name>` quando `(private)` existir

## Required Files

### Package

- `package.json`
- `tsconfig.json`
- `jest.config.ts`
- `src/index.ts`
- `test/index.test.ts`

### Backend

- `<module-name>.controller.ts`
- `<module-name>.prisma.ts`
- `<module-name>.module.ts`
- `index.ts` (re-export do módulo)
- Registro do `<ModuleName>Module` em `<backendAppPath>/src/app.module.ts`
- `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- Dependência `<scope>/<module-name>` em `<backendAppPath>/package.json`

### Frontend

- `<frontendAppPath>/src/modules/<module-name>/components/<module-name>-dashboard.component.tsx`
- `<frontendAppPath>/src/modules/<module-name>/data/index.ts`
- `<frontendAppPath>/src/modules/<module-name>/pages/dashboard.page.tsx`
- `<frontendAppPath>/src/modules/<module-name>/index.ts`
- `<frontendAppPath>/src/app/(private)/<module-name>/page.tsx` quando `(private)` existir (apenas `page.tsx`; sem `layout.tsx` por módulo)
- atualização no layout do grupo `(private)` (`<frontendAppPath>/src/app/(private)/layout.tsx`) adicionando o item do novo módulo em `NAVIGATION_SECTIONS` (label/href/icon/match) e garantindo o import do ícone `lucide-react`
- Dependência `<scope>/<module-name>` em `<frontendAppPath>/package.json`

> A arquitetura esperada usa `src/modules` e `src/app` dentro de `apps/frontend`.

## Package Rules

- Nome do pacote: `<scope>/<module-name>`.
- Dependência obrigatória em `<scope>/<basename(sharedModulePath)>`.
- Dependência do módulo novo também deve ser adicionada em backend e frontend:
  - `<backendAppPath>/package.json` -> `<scope>/<module-name>: "*"`
  - `<frontendAppPath>/package.json` -> `<scope>/<module-name>: "*"`
- O nome real do módulo shared é derivado de `basename(sharedModulePath)`.
- Namespace por precedência:
  - `--scope`
  - `PROJECT_NAMESPACE` ou `SKILLS_NAMESPACE`
  - `skills.config.local.json` (em `.claude/skills/.env`, `.claude/skills/.env` ou `.env/`)
  - `skills.config.json` (em `.claude/skills/.env`, `.claude/skills/.env` ou `.env/`)
  - fallback de `packages/shared/package.json`
- Scripts padrão:
  - `dev: tsc --watch`
  - `build: tsc`
  - `test: jest --coverage`
  - `test:watch: jest --watchAll`

## Source Rules

- `src/index.ts` deve exportar uma API mínima do módulo (`getModuleName`).
- `test/index.test.ts` deve validar essa API mínima.

## Backend Rules

- `controller` deve expor endpoint `GET /<module-name>` de exemplo.
- `<module-name>.prisma.ts` deve encapsular acesso ao `PrismaService`.
- `module` deve declarar o controller no decorator `@Module`.
- `module` deve importar `DbModule` e registrar/exportar o provider Prisma do módulo.
- `<module-name>.model.prisma` deve existir como placeholder de modelos do módulo.
- O módulo novo deve ser importado e adicionado no array `imports` do `AppModule`.

## Frontend Rules

- O projeto usa um **shell único** (`AdminShell` + `ShellProvider`) e um **menu de navegação único** (`NAVIGATION_SECTIONS`) declarados no layout do grupo `(private)`. As páginas de cada módulo herdam esse shell.
- **Não** se cria `layout.tsx` por módulo nem menu lateral por módulo. Não há `PrivateAppShell`, `moduleItems`, `dashboard/layout.tsx`, `data/*-menu.data.ts` ou `*-navigation.component.tsx`.
- O dashboard deve usar `EmptyDashboardState` de `shared/components/ui/empty-dashboard-state.tsx` quando o componente existir no projeto.
- `EmptyDashboardState` deve aceitar `moduleName?: string`; para dashboards de modulo, passar `moduleName`, e sem essa prop manter "Dashboard Vazio".
- Se o componente base de dashboard vazio não existir, gerar fallback local simples para evitar erro de compilação.
- A página de dashboard deve renderizar o componente de dashboard.
- A rota principal do módulo (`page.tsx`) deve renderizar a página de dashboard dentro de `<frontendAppPath>/src/app/(private)` quando esse grupo existir.
- O registro no menu deve acrescentar (de forma não destrutiva) um item ao final do array `items` da primeira seção de `NAVIGATION_SECTIONS`: `{ id, label (PT-BR), href: '/<module-name>', icon, match: 'prefix' }`, com o ícone de `lucide-react` definido por regras determinísticas e importado no topo do arquivo.
- O registro é idempotente (não duplica `/<module-name>`) e não reordena/reescreve os itens já existentes. Falha em localizar `NAVIGATION_SECTIONS` é não fatal (log `[RISK]`).
- Os labels do menu devem respeitar grafia PT-BR com acentuação correta quando aplicável.
- Pastas e arquivos do frontend devem seguir kebab-case em minúsculo.
- O arquivo de componente deve usar sufixo `.component.tsx`.
- O arquivo de página interna deve usar sufixo `.page.tsx`.

## Notes

- `--scope` permite forçar namespace explícito (ex.: `@namespace`, `@acme`).
- Sem `--scope`, usar a precedência de configuração global da skill.
- `--force` permite sobrescrever os diretórios de package/backend/frontend do módulo.
- Seguir convenção global em `../../skills-standards.md`.
- Comando recomendado (cross-platform): `node .claude/skills/config-new-module/scripts/create-module.mjs <module-name>` (ou ajuste para `.claude/skills` quando aplicável).
