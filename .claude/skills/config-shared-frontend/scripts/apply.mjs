#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = process.cwd()
const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appsDir = path.join(root, 'apps')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyDirContent(source, target) {
  ensureDir(target)
  const entries = fs.readdirSync(source, { withFileTypes: true })
  for (const entry of entries) {
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyDirContent(from, to)
    else fs.copyFileSync(from, to)
  }
}

function copyTemplate(from, to) {
  ensureDir(path.dirname(to))
  fs.copyFileSync(from, to)
}

// ── Resolução flexível do app de destino ─────────────────────────────────────
// O app frontend pode se chamar `frontend`, `web` ou outro nome. Estratégia:
//   1. nome explícito via argumento: `apply.mjs <nome>` ou `--app=<nome>`
//   2. autodetecção: único app Next.js em apps/ → usa esse
//   3. ambíguo (0 ou >1) → erro pedindo o nome (a IA deve perguntar ao usuário)

function parseAppArg() {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--app' || a === '--target') return args[i + 1]
    if (a.startsWith('--app=')) return a.slice('--app='.length)
    if (a.startsWith('--target=')) return a.slice('--target='.length)
    if (!a.startsWith('-')) return a
  }
  return null
}

function isNextApp(dir) {
  const pkgPath = path.join(dir, 'package.json')
  const hasNextDep = fs.existsSync(pkgPath) && /"next"\s*:/.test(fs.readFileSync(pkgPath, 'utf8'))
  const hasAppDir = fs.existsSync(path.join(dir, 'src', 'app')) || fs.existsSync(path.join(dir, 'app'))
  return hasNextDep || hasAppDir
}

function listNextApps() {
  if (!fs.existsSync(appsDir)) return []
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => isNextApp(path.join(appsDir, name)))
}

function resolveFrontendDir() {
  const requested = parseAppArg()

  if (requested) {
    const dir = path.join(appsDir, requested)
    if (!fs.existsSync(dir)) {
      throw new Error(`App "${requested}" não encontrado em apps/. Apps disponíveis: ${listNextApps().join(', ') || '(nenhum)'}`)
    }
    return dir
  }

  const candidates = listNextApps()
  if (candidates.length === 0) {
    throw new Error(
      'Nenhum app frontend (Next.js) encontrado em apps/. Rode config-project antes, ou informe o nome: node apply.mjs <nome-do-app>',
    )
  }
  if (candidates.length > 1) {
    throw new Error(
      `Múltiplos apps frontend encontrados em apps/: ${candidates.join(', ')}. Informe qual usar: node apply.mjs <nome-do-app>`,
    )
  }
  return path.join(appsDir, candidates[0])
}

// srcRoot suporta layout com ou sem `src/`.
function resolveSrcRoot(frontendDir) {
  return fs.existsSync(path.join(frontendDir, 'src')) ? path.join(frontendDir, 'src') : frontendDir
}

function getPkgName(frontendDir) {
  const pkg = JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8'))
  return pkg.name
}

function toAppName(packageName) {
  const raw = packageName.includes('/') ? packageName.split('/').pop() : packageName
  return raw
    .split(/[-_]/g)
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
    .join('')
}

function patchAppLogo(sharedDir, appName) {
  const logoPath = path.join(sharedDir, 'components', 'branding', 'app-logo.component.tsx')
  let content = fs.readFileSync(logoPath, 'utf8')
  content = content.replace(/const APP_NAME = '.*?';/, `const APP_NAME = '${appName}';`)
  fs.writeFileSync(logoPath, content, 'utf8')
}

// O app é dark-only: o root layout precisa ter a classe `dark` no <html> para
// que o tema escuro e o variante `dark:` fiquem sempre ativos. Idempotente.
function patchRootLayoutDark(appDir) {
  const layoutPath = path.join(appDir, 'layout.tsx')
  if (!fs.existsSync(layoutPath)) return false

  const content = fs.readFileSync(layoutPath, 'utf8')

  // Localiza a tag <html ...> de abertura.
  const htmlMatch = content.match(/<html\b[^>]*>/)
  if (!htmlMatch) return false

  const htmlTag = htmlMatch[0]
  // Já está em dark? Não mexe.
  if (/\bdark\b/.test(htmlTag)) return false

  let patchedTag
  if (/className=\{`/.test(htmlTag)) {
    // className={`...`}  → insere `dark ` logo após a crase de abertura
    patchedTag = htmlTag.replace(/className=\{`/, 'className={`dark ')
  } else if (/className=("|')/.test(htmlTag)) {
    // className="..." | '...'  → insere `dark ` logo após a aspa de abertura
    patchedTag = htmlTag.replace(/className=("|')/, 'className=$1dark ')
  } else {
    // sem className  → adiciona className="dark"
    patchedTag = htmlTag.replace(/<html\b/, '<html className="dark"')
  }

  fs.writeFileSync(layoutPath, content.replace(htmlTag, patchedTag), 'utf8')
  return true
}

function run(command) {
  execSync(command, { stdio: 'inherit', cwd: root })
}

function main() {
  const frontendDir = resolveFrontendDir()
  const srcDir = resolveSrcRoot(frontendDir)
  const appDir = path.join(srcDir, 'app')
  const sharedDir = path.join(srcDir, 'shared')
  const publicDir = path.join(frontendDir, 'public')

  const frontendPkg = getPkgName(frontendDir)
  const appName = toAppName(frontendPkg)
  const assets = path.join(skillDir, 'assets')

  console.log(`→ Aplicando config-shared-frontend em ${path.relative(root, frontendDir)} (pacote: ${frontendPkg})`)

  run(
    `npm install lucide-react clsx tailwind-merge class-variance-authority radix-ui react-hook-form react-day-picker date-fns recharts sonner @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-radio-group @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs --workspace ${frontendPkg}`,
  )

  // shared/ — apenas apresentação e utilitários. A navegação NÃO mora aqui:
  // os caminhos fazem parte do estado da aplicação e vivem no layout (private).
  copyDirContent(path.join(assets, 'shared'), sharedDir)
  patchAppLogo(sharedDir, appName)

  // public/ — assets estáticos servidos pela raiz (ex.: ilustrações referenciadas
  // por componentes shared como empty-dashboard-state). Copia toda a árvore.
  const publicAssets = path.join(assets, 'public')
  if (fs.existsSync(publicAssets)) copyDirContent(publicAssets, publicDir)

  // Design system dark-only: escreve o globals.css com todos os tokens do tema
  // escuro (os componentes shared usam bg-card, text-muted-foreground, etc.) e
  // garante a classe `dark` no <html> do root layout.
  copyTemplate(path.join(assets, 'app', 'globals.template.css'), path.join(appDir, 'globals.css'))
  patchRootLayoutDark(appDir)

  // Rotas Next.js — landing (raiz), join (public) e dashboard aberto (private).
  copyTemplate(path.join(assets, 'app', 'page.template.tsx'), path.join(appDir, 'page.tsx'))
  copyTemplate(
    path.join(assets, 'app', '(private)', 'layout.template.tsx'),
    path.join(appDir, '(private)', 'layout.tsx'),
  )
  copyTemplate(
    path.join(assets, 'app', '(public)', 'layout.template.tsx'),
    path.join(appDir, '(public)', 'layout.tsx'),
  )
  copyTemplate(
    path.join(assets, 'app', '(private)', 'dashboard', 'page.template.tsx'),
    path.join(appDir, '(private)', 'dashboard', 'page.tsx'),
  )
  copyTemplate(
    path.join(assets, 'app', '(public)', 'join', 'page.template.tsx'),
    path.join(appDir, '(public)', 'join', 'page.tsx'),
  )

  run('npm run format')
}

main()
