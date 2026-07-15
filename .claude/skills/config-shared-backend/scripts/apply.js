#!/usr/bin/env node
/**
 * apply.js — deterministically rebuilds the shared backend NestJS layer
 * and ensures packages/shared/src/dto/authenticated-user.dto.ts exists.
 *
 * Usage: node .claude/skills/config-shared-backend/scripts/apply.js [--force]
 *
 * --force  overwrites existing files even if unchanged
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const FORCE = process.argv.includes('--force')
const ROOT = process.cwd()
const SKILL_ASSETS = path.resolve(__dirname, '../assets')
const LOG = '[config-shared-backend]'

function log(msg) {
  console.log(`${LOG} ${msg}`)
}

// ─── resolve shared package name from skills.config.json ─────────────────────

function resolveSharedPackageName() {
  const candidates = ['.claude/skills/.env', '.claude/skills/.env', '.claude/skills/.env', '.env']
  for (const rel of candidates) {
    const configPath = path.join(ROOT, rel, 'skills.config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        const defaults = config.defaults ?? config
        const namespace = defaults.namespace ?? ''
        const sharedModule = path.basename(defaults.sharedModulePath ?? 'packages/shared')
        if (namespace) {
          return `${namespace}/${sharedModule}`
        }
      } catch {}
    }
  }
  return '@namespace/shared'
}

// ─── copy asset with placeholder replacement ──────────────────────────────────

function copyAsset(relPath, sharedPackageName) {
  const src = path.join(SKILL_ASSETS, relPath)
  const dest = path.join(ROOT, relPath)
  const destDir = path.dirname(dest)

  if (!fs.existsSync(src)) {
    throw new Error(`Asset not found: ${src}`)
  }

  fs.mkdirSync(destDir, { recursive: true })

  let srcContent = fs.readFileSync(src, 'utf8')
  srcContent = srcContent.split('{{SHARED_PACKAGE}}').join(sharedPackageName)

  if (!FORCE && fs.existsSync(dest)) {
    const destContent = fs.readFileSync(dest, 'utf8')
    if (srcContent === destContent) {
      log(`No changes: ${relPath}`)
      return
    }
  }

  fs.writeFileSync(dest, srcContent, 'utf8')
  log(`Copied: ${relPath}`)
}

// ─── cleanup legacy PT-BR named files ────────────────────────────────────────

function cleanLegacy() {
  const legacyFiles = [
    'apps/backend/src/shared/auth/estrategia-jwt.ts',
    'apps/backend/src/shared/auth/guarda-jwt.ts',
    'apps/backend/src/shared/auth/mapeador-usuario-auth.ts',
    'apps/backend/src/shared/decorators/publica.decorator.ts',
    'apps/backend/src/shared/decorators/usuario-atual.decorator.ts',
    'apps/backend/src/shared/errors/filtro-excecao-api.ts',
    'apps/backend/src/shared/errors/resposta-de-erro.type.ts',
    'apps/backend/src/shared/types/payload-jwt.type.ts',
    'apps/backend/src/shared/types/requisicao-autenticada.type.ts',
    'apps/backend/src/shared/modulo-compartilhado.ts',
    'packages/shared/src/dto/usuario-autenticado.dto.ts',
  ]

  for (const relPath of legacyFiles) {
    const fullPath = path.join(ROOT, relPath)
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath)
      log(`Removed legacy file: ${relPath}`)
    }
  }
}

// ─── ensure dependencies ──────────────────────────────────────────────────────

function ensureDependencies() {
  const backendPkg = path.join(ROOT, 'apps/backend/package.json')
  if (!fs.existsSync(backendPkg)) {
    log('WARNING: apps/backend/package.json not found, skipping dependency check.')
    return
  }

  const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf8'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  const required = ['@nestjs/jwt', '@nestjs/passport', '@nestjs/config', 'passport', 'passport-jwt']
  const requiredTypes = ['@types/passport-jwt']

  const missing = required.filter(d => !deps[d])
  const missingTypes = requiredTypes.filter(d => !deps[d])

  if (missing.length > 0 || missingTypes.length > 0) {
    const allMissing = [...missing, ...missingTypes]
    log(`Installing missing dependencies: ${allMissing.join(', ')}`)
    execSync(
      `npm install --workspace ${pkg.name} ${allMissing.join(' ')}`,
      { cwd: ROOT, stdio: 'inherit' }
    )
  } else {
    log('JWT/Passport dependencies already present.')
  }
}

// ─── ensure packages/shared exports ──────────────────────────────────────────

function ensureSharedDtoIndex() {
  const indexPath = path.join(ROOT, 'packages/shared/src/dto/index.ts')
  const exportLine = `export * from './authenticated-user.dto'`

  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `${exportLine}\n`, 'utf8')
    log(`Created: packages/shared/src/dto/index.ts`)
    return
  }

  const content = fs.readFileSync(indexPath, 'utf8')
  if (!content.includes(exportLine)) {
    fs.appendFileSync(indexPath, `\n${exportLine}\n`)
    log(`Added export to: packages/shared/src/dto/index.ts`)
  } else {
    log(`packages/shared/src/dto/index.ts already exports authenticated-user.dto`)
  }
}

function ensureSharedIndex() {
  const indexPath = path.join(ROOT, 'packages/shared/src/index.ts')
  const exportLine = `export * from './dto'`

  if (!fs.existsSync(indexPath)) {
    log('WARNING: packages/shared/src/index.ts not found, skipping check.')
    return
  }

  const content = fs.readFileSync(indexPath, 'utf8')
  if (!content.includes(exportLine)) {
    const newContent = `${exportLine}\n${content}`
    fs.writeFileSync(indexPath, newContent, 'utf8')
    log(`Added export to: packages/shared/src/index.ts`)
  } else {
    log(`packages/shared/src/index.ts already exports ./dto`)
  }
}

function ensureSharedErrorExport() {
  // Legacy step removed: current shared contract does not expose ./error or ./base/errors in root index.
}

function removeStaleBaseErrors() {
  const staleFile = path.join(ROOT, 'packages/shared/src/base/errors.ts')
  const baseIndex = path.join(ROOT, 'packages/shared/src/base/index.ts')

  if (fs.existsSync(staleFile)) {
    fs.rmSync(staleFile)
    log(`Removed stale file: packages/shared/src/base/errors.ts`)
  }

  if (fs.existsSync(baseIndex)) {
    const content = fs.readFileSync(baseIndex, 'utf8')
    const cleaned = content
      .split('\n')
      .filter(line => !line.includes(`export * from './errors'`))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
    if (cleaned !== content) {
      fs.writeFileSync(baseIndex, cleaned, 'utf8')
      log(`Removed stale export from: packages/shared/src/base/index.ts`)
    }
  }
}

// ─── patch app.module.ts (idempotent) ────────────────────────────────────────

function patchAppModule() {
  const filePath = path.join(ROOT, 'apps/backend/src/app.module.ts')
  if (!fs.existsSync(filePath)) {
    log('WARNING: apps/backend/src/app.module.ts not found, skipping patch.')
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  const importLine = `import { SharedModule } from './shared/shared.module';`
  if (!content.includes(importLine)) {
    // insert after the last existing import line
    content = content.replace(
      /^(import .+;\n)(?!import)/m,
      (match) => `${match}${importLine}\n`,
    )
    changed = true
  }

  // add SharedModule to imports array if not already there
  if (!/imports:\s*\[([^\]]*\bSharedModule\b)/.test(content)) {
    content = content.replace(/imports:\s*\[/, 'imports: [SharedModule, ')
    changed = true
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    log('Patched: apps/backend/src/app.module.ts (added SharedModule)')
  } else {
    log('No changes: apps/backend/src/app.module.ts already has SharedModule')
  }
}

// ─── patch main.ts (idempotent) ──────────────────────────────────────────────

function patchMainTs() {
  const filePath = path.join(ROOT, 'apps/backend/src/main.ts')
  if (!fs.existsSync(filePath)) {
    log('WARNING: apps/backend/src/main.ts not found, skipping patch.')
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  const importLine = `import { ApiExceptionFilter } from './shared/errors/api-exception.filter';`
  if (!content.includes(importLine)) {
    content = content.replace(
      /^(import .+;\n)(?!import)/m,
      (match) => `${match}${importLine}\n`,
    )
    changed = true
  }

  const filterCall = `app.useGlobalFilters(new ApiExceptionFilter());`
  if (!content.includes(filterCall)) {
    // insert before the first app.listen() call
    content = content.replace(
      /([ \t]*)(await app\.listen\()/,
      `$1${filterCall}\n$1$2`,
    )
    changed = true
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    log('Patched: apps/backend/src/main.ts (added ApiExceptionFilter)')
  } else {
    log('No changes: apps/backend/src/main.ts already has ApiExceptionFilter')
  }
}

function buildSharedPackage() {
  const pkgPath = path.join(ROOT, 'packages/shared/package.json')
  if (!fs.existsSync(pkgPath)) {
    log('WARNING: packages/shared/package.json not found, skipping build.')
    return
  }
  log('Building packages/shared...')
  execSync('npm run build --workspace packages/shared', { cwd: ROOT, stdio: 'inherit' })
  log('packages/shared built successfully.')
}

// ─── main ─────────────────────────────────────────────────────────────────────

log('Starting...')

const sharedPackageName = resolveSharedPackageName()
log(`Using shared package: ${sharedPackageName}`)

// 1. Ensure backend dependencies
ensureDependencies()

// 2. Remove legacy PT-BR named files
cleanLegacy()

// 3. Copy shared assets
copyAsset('packages/shared/src/dto/authenticated-user.dto.ts', sharedPackageName)
ensureSharedDtoIndex()
ensureSharedIndex()
removeStaleBaseErrors()
ensureSharedErrorExport()

// 3b. Build shared package so backend can resolve types
buildSharedPackage()

// 4. Copy all backend shared assets
const backendSharedAssets = [
  'apps/backend/src/shared/auth/jwt.strategy.ts',
  'apps/backend/src/shared/auth/jwt.guard.ts',
  'apps/backend/src/shared/auth/auth-user.mapper.ts',
  'apps/backend/src/shared/auth/index.ts',
  'apps/backend/src/shared/decorators/public.decorator.ts',
  'apps/backend/src/shared/decorators/current-user.decorator.ts',
  'apps/backend/src/shared/decorators/index.ts',
  'apps/backend/src/shared/errors/api-exception.filter.ts',
  'apps/backend/src/shared/errors/api-error-response.type.ts',
  'apps/backend/src/shared/errors/index.ts',
  'apps/backend/src/shared/types/jwt-payload.type.ts',
  'apps/backend/src/shared/types/authenticated-request.type.ts',
  'apps/backend/src/shared/types/index.ts',
  'apps/backend/src/shared/shared.module.ts',
]

for (const asset of backendSharedAssets) {
  copyAsset(asset, sharedPackageName)
}

// 5. Patch app.module.ts and main.ts
patchAppModule()
patchMainTs()

log('Done.')
