---
name: config-new-module
description: Criar um novo módulo de forma determinística no padrão do projeto Workspace, gerando scaffold em `modules/*`, `apps/backend/src/modules/*` e `apps/frontend/src/modules/*`. Usar quando o pedido envolver criação de módulo full-stack no monorepo com package TypeScript, módulo NestJS e dashboard inicial no web.
---

# Config New Module

## Overview

Padronizar a criação de novos módulos no monorepo com três entregas sincronizadas:

1. pacote de dominio puro em `modules/<module-name>` (template TypeScript sem dependencias de Nest/Next/React/Prisma);
2. módulo backend em `<backendAppPath>/src/modules/<module-name>` (Nest module + controller + provider Prisma de módulo) e modelo Prisma inicial em `<backendAppPath>/prisma/models/<module-name>.model.prisma`;
3. modulo frontend em `<frontendAppPath>/src/modules/<module-name>`, com pastas `components`, `data`, `pages` e rota principal em `<frontendAppPath>/src/app/(private)/<module-name>/page.tsx` quando o grupo `(private)` existir. O projeto usa um **shell único** (`AdminShell`) e um **menu de navegação único** declarado como `NAVIGATION_SECTIONS` no layout do grupo `(private)` — as páginas do módulo herdam esse shell, portanto **não** se gera `layout.tsx` por módulo. A entrada do módulo é registrada (de forma não destrutiva) em `NAVIGATION_SECTIONS`.

Executar o script Node da skill para receber o nome do módulo e gerar os arquivos mínimos de código e teste, sem depender de shell específico de SO.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.claude/skills/.env`, `.claude/skills/.env` ou `.env/`).

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module.mjs <module-name>`.
3. Namespace é resolvido por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback automático.
4. Conferir a estrutura criada em:
   - `modules/<module-name>`
   - `<backendAppPath>/src/modules/<module-name>`
   - `<backendAppPath>/prisma/models/<module-name>.model.prisma`
   - `<frontendAppPath>/src/modules/<module-name>`
   - `<frontendAppPath>/src/app/(private)/<module-name>` **ou** `<frontendAppPath>/src/app/<module-name>` quando nao existir grupo `(private)`
5. Confirmar que o package contém apenas `src/index.ts` com a função `getModuleName` e o teste `test/index.test.ts`.
6. Confirmar que o backend contém `<module-name>.module.ts`, `<module-name>.controller.ts`, `<module-name>.prisma.ts`, e que o módulo foi registrado no `app.module.ts`.
7. Confirmar que o frontend contém o dashboard template, a rota principal (`page.tsx`) e que o módulo foi registrado no menu de navegação.
   - a rota `app/(private)/<module-name>/page.tsx` (ou fallback sem `(private)`) deve existir e renderizar a `DashboardPage` do módulo.
   - **não** se gera `layout.tsx` por módulo: as páginas herdam o `AdminShell` único do layout do grupo `(private)`.
   - o componente `<module-name>-dashboard.component.tsx` deve usar `EmptyDashboardState` de `shared/components/ui/empty-dashboard-state.tsx` quando esse componente existir no projeto, passando `moduleName` quando aplicável.
   - o menu de navegação único (`NAVIGATION_SECTIONS` no layout do grupo `(private)`) deve conter o novo módulo: item `{ id, label (PT-BR), href: '/<module-name>', icon, match: 'prefix' }` acrescentado ao final do array `items` da primeira seção, com o ícone determinístico do `lucide-react` importado no topo do arquivo.
   - os rótulos do menu devem respeitar grafia PT-BR com acentuação correta quando aplicável.
   - o registro é **idempotente** (não duplica) e **não destrutivo** (não reordena nem altera os itens já existentes).
8. Confirmar que `<backendAppPath>/package.json` e `<frontendAppPath>/package.json` possuem a dependência `<scope>/<module-name>`.
9. Se a estrutura do menu (`NAVIGATION_SECTIONS`) não for localizada, o registro é ignorado de forma não fatal (apenas logado com `[RISK]`) — a criação do módulo não é abortada.
10. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar módulo no namespace padrão do projeto:

```bash
node .claude/skills/config-new-module/scripts/create-module.mjs <module-name>
```

> Se o repositório estiver em `.claude/skills`, ajuste o caminho do comando.

Definir namespace por variável de ambiente:

```bash
PROJECT_NAMESPACE=@namespace node .claude/skills/config-new-module/scripts/create-module.mjs <module-name>
```

Criar módulo com namespace explícito:

```bash
node .claude/skills/config-new-module/scripts/create-module.mjs <module-name> --scope @namespace
```

Sobrescrever diretório existente:

```bash
node .claude/skills/config-new-module/scripts/create-module.mjs <module-name> --force
```

## Output Contract

O script deve gerar exatamente:

- `modules/<module-name>/package.json`
- `modules/<module-name>/tsconfig.json`
- `modules/<module-name>/jest.config.ts`
- `modules/<module-name>/src/index.ts` (apenas a função `getModuleName`)
- `modules/<module-name>/test/index.test.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.controller.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.prisma.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.module.ts`
- `<backendAppPath>/src/modules/<module-name>/index.ts`
- `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- atualização em `<backendAppPath>/src/app.module.ts` para importar e registrar `<ModuleName>Module`
- `<frontendAppPath>/src/modules/<module-name>/components/<module-name>-dashboard.component.tsx`
- `<frontendAppPath>/src/modules/<module-name>/data/index.ts`
- `<frontendAppPath>/src/modules/<module-name>/pages/dashboard.page.tsx`
- `<frontendAppPath>/src/modules/<module-name>/index.ts`
- `<frontendAppPath>/src/app/(private)/<module-name>/page.tsx` quando `(private)` existir, senão `<frontendAppPath>/src/app/<module-name>/page.tsx` (apenas `page.tsx`; sem `layout.tsx` por módulo)
- atualização no layout do grupo `(private)` (`<frontendAppPath>/src/app/(private)/layout.tsx`, ou `<frontendAppPath>/src/app/layout.tsx` no fallback) adicionando a entrada determinística do módulo em `NAVIGATION_SECTIONS` e garantindo o import do ícone `lucide-react`
- atualização em `<backendAppPath>/package.json` com dependência `<scope>/<module-name>`
- atualização em `<frontendAppPath>/package.json` com dependência `<scope>/<module-name>`

Regra do dashboard do módulo:

- quando existir `shared/components/ui/empty-dashboard-state.tsx`, o arquivo `<module-name>-dashboard.component.tsx` deve referenciar `EmptyDashboardState` como conteúdo principal do dashboard.
- a prop `moduleName` deve ser opcional no `EmptyDashboardState`; quando nao informada, manter titulo padrao "Dashboard Vazio".

Regra do menu de navegação (`NAVIGATION_SECTIONS`):

- o projeto tem um **único menu de navegação**, declarado como `const NAVIGATION_SECTIONS: SidebarMenuSection[] = [...]` no layout do grupo `(private)` (`app/(private)/layout.tsx`), que alimenta o `SidebarMenu` do `AdminShell` único.
- o módulo novo deve ser acrescentado ao final do array `items` da **primeira seção**, com item navegável e ícone do `lucide-react` escolhido por mapeamento determinístico baseado no nome do módulo.
- o ícone escolhido deve ser garantido no import de `lucide-react` no topo do arquivo (sem duplicar specifiers e sem afetar outros imports).
- os labels devem considerar acentuação correta em PT-BR (ex.: `Autenticação`, `Cartões`, `Transações`).
- o registro é **idempotente** (não duplica quando a rota `/<module-name>` já existe) e **não destrutivo**: os itens já curados no menu não são reordenados nem reescritos — o novo item apenas é anexado.
- caso `NAVIGATION_SECTIONS` (ou o array `items`) não seja localizado, o registro é ignorado de forma não fatal, com log `[RISK]`.

Regra do shell e layout:

- o projeto usa um **shell único** (`AdminShell` + `ShellProvider`) renderizado no layout do grupo `(private)`. As páginas de cada módulo herdam esse shell.
- **não** se cria `layout.tsx` por módulo nem menu lateral por módulo. Não há dependência de `PrivateAppShell`, `moduleItems`, `dashboard/layout.tsx`, `data/*-menu.data.ts` ou `*-navigation.component.tsx`.

## Naming Convention

- Pastas: sempre minúsculas em kebab-case.
- Arquivos: sempre minúsculos em kebab-case, com sufixo de tipo no nome (ex.: `branch.controller.ts`, `branch.module.ts`, `branch-dashboard.component.tsx`, `dashboard.page.tsx`).
- Convenção global compartilhada: `../skills-standards.md`.

Consultar `references/module-template.md` para o contrato completo dos arquivos gerados.

## Shared Config

- Arquivo versionado: `skills.config.json` (`.claude/skills/.env`, `.claude/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Risk Logging Guardrails

- Registrar fatos de execucao em `.log/skills.log` com marcador no inicio da linha.
- Marcadores minimos esperados: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Sempre registrar `[RISK]` quando houver sobrescrita, exclusao, rename/move, ou fallback forcado em arquivos/pastas.
- Toda falha inesperada deve gerar `[FAIL]` com descricao factual curta do evento.
- Operacoes de terminal e alteracoes de arquivos devem passar pelos utilitarios compartilhados em `../utils` para manter rastreabilidade consistente.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
