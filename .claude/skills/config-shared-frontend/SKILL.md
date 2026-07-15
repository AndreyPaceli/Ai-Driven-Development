---
name: config-shared-frontend
description: Configura a estrutura compartilhada (shared/) e as rotas Next.js (grupos public/private) em um projeto frontend de destino. A navegação NÃO fica em shared/ — os caminhos são estado da aplicação e vivem no layout do grupo (private). Gera menu único, landing page, tela de auth de exemplo e um dashboard aberto (sem bloqueio de auth). Usa os assets embarcados nesta skill como fonte — nenhuma dependência de projeto específico em runtime.
tools: Read, Glob, Grep, Bash, Write, Edit
---

# config-shared-frontend

## Comando oficial (determinístico)

Execute sempre a partir da raiz do monorepo:

```bash
# Autodetecta o app frontend quando há apenas um em apps/
node .claude/skills/config-shared-frontend/scripts/apply.mjs

# Ou informe o nome do app de destino (frontend, web, ou outro)
node .claude/skills/config-shared-frontend/scripts/apply.mjs <nome-do-app>
```

Esse script aplica toda a skill de forma idempotente (dependências, `shared/`, rotas e formatação).

### Resolução do app de destino (flexível)

O app frontend **não** precisa se chamar `frontend` — pode ser `web` ou qualquer outro nome
em `apps/`. O script resolve o destino assim:

1. **Nome explícito** via argumento (`apply.mjs web` ou `--app=web`) — sempre tem prioridade.
2. **Autodetecção**: se houver **exatamente um** app Next.js em `apps/` (com `next` no
   `package.json` ou pasta `app/`), usa esse.
3. **Ambíguo**: se houver **zero ou mais de um** candidato, o script falha listando as
   opções. Nesse caso, **pergunte ao usuário** qual app usar (via `AskUserQuestion`) e
   re-execute passando o nome. Suporta layout com ou sem `src/` (`src/app` ou `app`).

Recria a pasta `shared/` e a estrutura de rotas Next.js em qualquer projeto frontend de destino.
Todos os arquivos necessários estão **embarcados** nesta skill em `assets/` — a skill é autossuficiente.

## Princípios de arquitetura

- **Navegação é estado da aplicação.** Os caminhos/itens de menu são definidos no
  `app/(private)/layout.tsx`, **não** em `shared/`. Para mudar o menu, edita-se o layout.
  Se um projeto tiver outra estrutura de navegação, basta alterar `NAVIGATION_SECTIONS`
  (ou trocar o componente de menu) no layout — `shared/` permanece intacto.
- **Menu único.** Há uma única área de navegação (sem rail de módulos / sem menu duplo).
  Todos os itens ficam em `sections` passados ao `SidebarMenu`.
- **Dashboard aberto.** O grupo `(private)` usa o `AdminShell`, mas **sem** guard de
  autenticação — as rotas privadas são acessíveis diretamente.

## Localização dos assets

```
.claude/skills/config-shared-frontend/assets/
  shared/          ← pasta shared completa, genérica, pronta para copiar (sem navegação)
  public/          ← assets estáticos servidos pela raiz (ilustrações etc.)
    illustrations/empty-dashboard-dark.svg  (usado por empty-dashboard-state)
  app/             ← templates de layouts e páginas de rota Next.js
    globals.template.css                    (design system dark-only — escrito em app/globals.css)
    page.template.tsx                       (landing page com hero)
    (public)/layout.template.tsx
    (public)/join/page.template.tsx         (tela de auth de exemplo, sem formulário)
    (private)/layout.template.tsx           (navegação inline + AdminShell, sem guard)
    (private)/dashboard/page.template.tsx   (dashboard aberto)
```

---

## Fase 1 — Ler contexto do projeto destino

Antes de qualquer ação, leia o contexto do projeto destino.

```bash
ls {DEST}/src/app/
cat {DEST}/package.json | grep -E '"name"|"next"|"react"'
cat {DEST}/tsconfig.json | grep -A5 '"paths"'
```

Capture:

- Nome do projeto (`package.json > name`)
- Versão do Next.js
- Alias de paths (`@/*` → `./src/*`)
- Se já existe pasta `shared/` no destino (pedir confirmação antes de sobrescrever)
- Se já existe estrutura `app/(private)/` ou `app/(public)/`

---

## Fase 2 — Resolver configuração automaticamente (sem perguntas)

**Não fazer perguntas ao usuário.** Resolver tudo pelos defaults abaixo.

### Nome do app

Extrair do `package.json > name` do destino:

- Com namespace (`@arquitetura/frontend`): usar a parte após `/` em PascalCase → `Frontend`
- Sem namespace (`myapp`): usar o nome em PascalCase → `Myapp`

### Navegação (menu único, no layout)

A navegação é definida **dentro** de `app/(private)/layout.tsx` em `NAVIGATION_SECTIONS`.
Default: uma seção `Navegação` com um único item `Dashboard` → `/dashboard`.
Não há menu de módulos. Para novos itens, adicionar entradas em `NAVIGATION_SECTIONS`.

### Rotas

```
/             → app/page.tsx                       (landing page com hero)
/join         → app/(public)/join/page.tsx         (tela de auth de exemplo)
/dashboard    → app/(private)/dashboard/page.tsx   (dashboard aberto)
```

### Sem guard de autenticação

O dashboard é **aberto**. O layout de `(private)` **não** inclui `RouteGuard`.
O botão **Sair** no menu de usuário do `AdminShell` redireciona para a landing page (`/`).

---

## Fase 3 — Instalar dependências do frontend

```bash
npm install \
  lucide-react clsx tailwind-merge class-variance-authority radix-ui \
  react-hook-form react-day-picker date-fns recharts sonner \
  @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-radio-group \
  @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs \
  --workspace {FRONTEND_PACKAGE_NAME}
```

Onde `{FRONTEND_PACKAGE_NAME}` é o valor de `name` no `package.json` do destino.

---

## Fase 4 — Copiar a pasta shared/

### 4a. Detectar shared existente

```bash
ls {DEST}/src/shared 2>/dev/null && echo "HAS_SHARED" || echo "NO_SHARED"
```

Se `shared/` já existir: **avisar e pedir confirmação explícita** antes de sobrescrever.

### 4b. Copiar todos os arquivos de assets/shared/

```bash
cp -r {SKILL_DIR}/assets/shared/. {DEST}/src/shared/
```

`shared/` contém apenas apresentação e utilitários — **nenhuma navegação**.

### 4b-bis. Copiar os assets estáticos de assets/public/

```bash
cp -r {SKILL_DIR}/assets/public/. {DEST}/public/
```

Inclui `illustrations/empty-dashboard-dark.svg`, referenciado por
`shared/components/ui/empty-dashboard-state.tsx`. Sem esse passo o dashboard
vazio renderiza com imagem quebrada.

### 4c. Personalizar AppLogo com o nome real

Editar `{DEST}/src/shared/components/branding/app-logo.component.tsx`:
substituir `const APP_NAME = 'App';` pelo nome resolvido na Fase 2.

### 4d. Verificar alias de import

Se `@/*` não existir no `tsconfig.json`, adicionar `"@/*": ["./src/*"]` em `compilerOptions.paths`.

---

## Fase 5 — Criar estrutura de rotas Next.js

Copiar os templates de `assets/app/` para o destino **sem modificações**:

| Template                                    | Destino                            |
| ------------------------------------------- | ---------------------------------- |
| `app/page.template.tsx`                     | `app/page.tsx`                     |
| `app/(public)/layout.template.tsx`          | `app/(public)/layout.tsx`          |
| `app/(public)/join/page.template.tsx`       | `app/(public)/join/page.tsx`       |
| `app/(private)/layout.template.tsx`         | `app/(private)/layout.tsx`         |
| `app/(private)/dashboard/page.template.tsx` | `app/(private)/dashboard/page.tsx` |
| `app/globals.template.css`                  | `app/globals.css`                  |

Detalhes:

- **Tema dark-only (`globals.css`)** — sobrescreve o `globals.css` gerado pelo
  `create-next-app` com o design system completo em **modo escuro fixo**: define todos
  os tokens (`--background`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, …)
  e os mapeia em `@theme inline` (os componentes shared usam `bg-card`,
  `text-muted-foreground`, `ring-ring`, etc.). Remove o `:root` claro e o
  `@media (prefers-color-scheme)`; declara `@custom-variant dark` para que o variante
  `dark:` resolva sempre o tema escuro. O script ainda garante a classe `dark` no
  `<html>` do root layout (`app/layout.tsx`), de forma idempotente.
- **Landing (`/`)** — hero com botões para `/join` e `/dashboard`.
- **Auth (`/join`)** — esqueleto sem formulário, com botões **Voltar** (`/`) e **Ir para o dashboard** (`/dashboard`).
- **Layout (private)** — `ShellProvider` + `AdminShell`. A navegação está inline em
  `NAVIGATION_SECTIONS` e é passada ao `SidebarMenu`. `onLogout` faz `router.push('/')`.
  **Não** há `RouteGuard`.
- **Dashboard (`/dashboard`)** — página aberta dentro do `AdminShell`.

---

## Fase 6 — Verificação final

```bash
ls {DEST}/src/shared/components/ui/sidebar-menu.component.tsx
ls {DEST}/src/app/page.tsx
ls {DEST}/src/app/(private)/layout.tsx
ls {DEST}/src/app/(private)/dashboard/page.tsx
ls {DEST}/src/app/(public)/layout.tsx
ls {DEST}/src/app/(public)/join/page.tsx

# A navegação NÃO deve existir em shared/
test ! -d {DEST}/src/shared/navigation && echo "OK: sem shared/navigation"
# Não deve haver guard de auth wired
test ! -d {DEST}/src/shared/auth && echo "OK: sem shared/auth"

# Tema dark-only aplicado
grep -q "color-scheme: dark" {DEST}/src/app/globals.css && echo "OK: globals.css dark-only"
grep -q 'className=.*dark' {DEST}/src/app/layout.tsx && echo "OK: <html> com classe dark"
# Não deve restar modo claro / alternância de tema
! grep -q "prefers-color-scheme" {DEST}/src/app/globals.css && echo "OK: sem prefers-color-scheme"
```

---

## Fase 7 — Formatação

```bash
npm run format
```

Executar na raiz do monorepo.

---

## Fase 8 — Relatório final

```
✅ config-shared-frontend concluído para {APP_NAME}

📁 shared/ → {DEST}/src/shared/   (apenas apresentação + utilitários, sem navegação)
   components/branding/app-logo.component.tsx  (nome: {APP_NAME})
   components/ui/                              (inclui sidebar-menu — menu único)
   context/shell.context.tsx
   hooks/ · i18n/ · lib/ · template/ · util/

🎨 Tema:
   app/globals.css                       → design system dark-only (tokens + @theme inline)
   app/layout.tsx                        → <html className="dark"> (modo escuro fixo)

🗺️  Rotas criadas:
   app/page.tsx                          → landing page (hero → /join e /dashboard)
   app/(public)/layout.tsx               → PublicBoxedLayout (auth renderiza bare)
   app/(public)/join/page.tsx            → tela de auth de exemplo (Voltar / Dashboard)
   app/(private)/layout.tsx              → ShellProvider + AdminShell (navegação inline, sem guard)
   app/(private)/dashboard/page.tsx      → dashboard aberto

⚠️  Próximos passos:
   1. Editar NAVIGATION_SECTIONS em app/(private)/layout.tsx para os menus reais
   2. Implementar o formulário real em app/(public)/join/page.tsx
   3. (Opcional) Adicionar guard de auth se as rotas privadas precisarem ser protegidas
   4. (Opcional) Ajustar as cores de marca nos tokens hsl(...) de app/globals.css
```

---

## Regras obrigatórias

- **Navegação vive no layout**, nunca em `shared/`. Não recriar `shared/navigation`.
- **Menu único** — não reintroduzir rail de módulos / menu duplo no `SidebarMenu`.
- **Dashboard aberto** — não adicionar `RouteGuard` ao layout de `(private)` por default.
- **Dark-only** — sobrescrever `app/globals.css` com o template do tema escuro e manter a
  classe `dark` no `<html>`. Não reintroduzir `:root` claro nem `prefers-color-scheme`.
- **Sempre** usar os assets embarcados em `.claude/skills/config-shared-frontend/assets/` como fonte.
- **Confirmar** antes de sobrescrever arquivos existentes no destino.
- **Manter** todos os imports `@/shared/...` intactos — não alterar o sistema de alias.
- **Nunca perguntar** configuração ao usuário — resolver tudo pelos defaults da Fase 2.

```

```
