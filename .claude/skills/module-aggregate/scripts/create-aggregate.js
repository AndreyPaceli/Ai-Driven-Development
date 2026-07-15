#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const VALID_MODES = new Set(['crud', 'example'])

const COMMON_AGGREGATE_FILES = [
  {
    template: path.join('assets', 'common', 'dto', 'aggregate.dto.ts.tpl'),
    output: ({ aggregateName }) => path.join('dto', `${aggregateName}.dto.ts`),
  },
  {
    template: path.join('assets', 'common', 'dto', 'index.ts.tpl'),
    output: () => path.join('dto', 'index.ts'),
  },
  {
    template: path.join('assets', 'common', 'model', 'entity.ts.tpl'),
    output: ({ aggregateName }) => path.join('model', `${aggregateName}.entity.ts`),
  },
  {
    template: path.join('assets', 'common', 'model', 'index.ts.tpl'),
    output: () => path.join('model', 'index.ts'),
  },
  {
    template: path.join('assets', 'common', 'provider', 'repository.ts.tpl'),
    output: ({ aggregateName }) => path.join('provider', `${aggregateName}.repository.ts`),
  },
  {
    template: path.join('assets', 'common', 'provider', 'index.ts.tpl'),
    output: () => path.join('provider', 'index.ts'),
  },
  {
    template: path.join('assets', 'common', 'aggregate', 'index.ts.tpl'),
    output: () => 'index.ts',
  },
]

// Test-only artifacts are generated at modules/<module>/test/**, never inside src/**.
const COMMON_MODULE_FILES = [
  {
    template: path.join('assets', 'common', 'test', 'mock', 'in-memory-repository.ts.tpl'),
    output: ({ aggregateName }) =>
      path.join('test', 'mock', `in-memory-${aggregateName}.repository.ts`),
  },
]

const SOURCE_FILES_BY_MODE = {
  crud: [
    {
      template: path.join('assets', 'use-case', 'crud', 'create.use-case.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('use-case', `create-${aggregateName}.use-case.ts`),
      exportLine: ({ aggregateName }) => `export * from './create-${aggregateName}.use-case'`,
    },
    {
      template: path.join('assets', 'use-case', 'crud', 'update.use-case.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('use-case', `update-${aggregateName}.use-case.ts`),
      exportLine: ({ aggregateName }) => `export * from './update-${aggregateName}.use-case'`,
    },
    {
      template: path.join('assets', 'use-case', 'crud', 'delete.use-case.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('use-case', `delete-${aggregateName}.use-case.ts`),
      exportLine: ({ aggregateName }) => `export * from './delete-${aggregateName}.use-case'`,
    },
    {
      template: path.join('assets', 'use-case', 'crud', 'find-by-id.use-case.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('use-case', `find-${aggregateName}-by-id.use-case.ts`),
      exportLine: ({ aggregateName }) => `export * from './find-${aggregateName}-by-id.use-case'`,
    },
  ],
  example: [
    {
      template: path.join('assets', 'use-case', 'example', 'create.use-case.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('use-case', `create-${aggregateName}.use-case.ts`),
      exportLine: ({ aggregateName }) => `export * from './create-${aggregateName}.use-case'`,
    },
  ],
}

const TEST_FILES_BY_MODE = {
  crud: [
    {
      template: path.join('assets', 'test', 'crud', 'create.use-case.test.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('test', aggregateName, `create-${aggregateName}.use-case.test.ts`),
    },
    {
      template: path.join('assets', 'test', 'crud', 'update.use-case.test.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('test', aggregateName, `update-${aggregateName}.use-case.test.ts`),
    },
    {
      template: path.join('assets', 'test', 'crud', 'delete.use-case.test.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('test', aggregateName, `delete-${aggregateName}.use-case.test.ts`),
    },
    {
      template: path.join('assets', 'test', 'crud', 'find-by-id.use-case.test.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('test', aggregateName, `find-${aggregateName}-by-id.use-case.test.ts`),
    },
  ],
  example: [
    {
      template: path.join('assets', 'test', 'example', 'create.use-case.test.ts.tpl'),
      output: ({ aggregateName }) =>
        path.join('test', aggregateName, `create-${aggregateName}.use-case.test.ts`),
    },
  ],
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const moduleName = args.module
  const aggregateInput = args.aggregate
  const mode = normalizeMode(args.mode)

  if (!moduleName) {
    fail('Provide --module <module-name>.')
  }

  if (!aggregateInput) {
    fail('Provide --aggregate <aggregate-name>.')
  }

  if (!mode) {
    fail(
      'Provide --mode <crud|example>. If the request does not include it, ask: "Deseja criar a base de use cases em \\"crud\\" ou \\"example\\"?"',
    )
  }

  if (!VALID_MODES.has(mode)) {
    fail('Mode must be "crud" or "example".')
  }

  if (!/^[a-z0-9-]+$/.test(moduleName)) {
    fail('Module name must match the existing folder in modules/<module>.')
  }

  const aggregateName = toKebabCase(aggregateInput)

  if (!aggregateName) {
    fail('Could not normalize the aggregate name.')
  }

  const projectRoot = process.cwd()
  const skillRoot = path.resolve(__dirname, '..')
  const moduleDir = path.join(projectRoot, 'modules', moduleName)
  const moduleSrcDir = path.join(moduleDir, 'src')
  const moduleIndex = path.join(moduleSrcDir, 'index.ts')
  const aggregateDir = path.join(moduleSrcDir, aggregateName)
  const aggregateTestDir = path.join(moduleDir, 'test', aggregateName)

  ensureDirectoryExists(moduleDir, `Module ${moduleName} does not exist at modules/${moduleName}.`)
  ensureDirectoryExists(
    moduleSrcDir,
    `Module ${moduleName} must contain modules/${moduleName}/src.`,
  )
  ensureFileExists(
    moduleIndex,
    `File modules/${moduleName}/src/index.ts was not found.`,
  )

  if (fs.existsSync(aggregateDir)) {
    fail(`Aggregate ${aggregateName} already exists at modules/${moduleName}/src/${aggregateName}.`)
  }

  if (fs.existsSync(aggregateTestDir)) {
    fail(`Aggregate tests for ${aggregateName} already exist at modules/${moduleName}/test/${aggregateName}.`)
  }

  const sharedPackage = resolveSharedPackage(projectRoot)

  const replacements = {
    '__AGGREGATE_NAME__': aggregateName,
    '__AGGREGATE_CLASS_NAME__': toPascalCase(aggregateName),
    '__AGGREGATE_REPOSITORY_NAME__': `${toPascalCase(aggregateName)}Repository`,
    '__AGGREGATE_IN_MEMORY_REPOSITORY_NAME__': `InMemory${toPascalCase(aggregateName)}Repository`,
    '__AGGREGATE_VARIABLE_NAME__': toCamelCase(aggregateName),
    '__SHARED_PACKAGE__': sharedPackage,
  }

  log(`Creating aggregate ${aggregateName} at modules/${moduleName}/src/${aggregateName}`)
  fs.mkdirSync(path.join(aggregateDir, 'dto'), { recursive: true })
  fs.mkdirSync(path.join(aggregateDir, 'model'), { recursive: true })
  fs.mkdirSync(path.join(aggregateDir, 'provider'), { recursive: true })
  fs.mkdirSync(path.join(aggregateDir, 'use-case'), { recursive: true })
  fs.mkdirSync(path.join(moduleDir, 'test', 'mock'), { recursive: true })
  fs.mkdirSync(aggregateTestDir, { recursive: true })

  for (const file of COMMON_AGGREGATE_FILES) {
    const templatePath = path.join(skillRoot, file.template)
    const outputPath = path.join(aggregateDir, file.output({ aggregateName }))
    materializeTemplate(templatePath, outputPath, replacements)
  }

  for (const file of COMMON_MODULE_FILES) {
    const templatePath = path.join(skillRoot, file.template)
    const outputPath = path.join(moduleDir, file.output({ aggregateName }))
    materializeTemplate(templatePath, outputPath, replacements)
  }

  const sourceFilesForMode = SOURCE_FILES_BY_MODE[mode]
  const testFilesForMode = TEST_FILES_BY_MODE[mode]

  for (const file of sourceFilesForMode) {
    const templatePath = path.join(skillRoot, file.template)
    const outputPath = path.join(aggregateDir, file.output({ aggregateName }))
    materializeTemplate(templatePath, outputPath, replacements)
  }

  for (const file of testFilesForMode) {
    const templatePath = path.join(skillRoot, file.template)
    const outputPath = path.join(moduleDir, file.output({ aggregateName }))
    materializeTemplate(templatePath, outputPath, replacements)
  }

  const useCaseIndexTemplatePath = path.join(
    skillRoot,
    'assets',
    'common',
    'use-case',
    'index.ts.tpl',
  )
  materializeTemplate(
    useCaseIndexTemplatePath,
    path.join(aggregateDir, 'use-case', 'index.ts'),
    {
      ...replacements,
      '__USE_CASE_EXPORTS__': sourceFilesForMode
        .map((file) => file.exportLine({ aggregateName }))
        .join('\n'),
    },
  )

  updateModuleIndex(moduleIndex, aggregateName)

  log(`Aggregate ${aggregateName} created successfully.`)
}

function parseArgs(argv) {
  const args = {}

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i]

    if (current === '--module' || current === '--modulo') {
      args.module = argv[i + 1]
      i += 1
      continue
    }

    if (current === '--aggregate' || current === '--agregado') {
      args.aggregate = argv[i + 1]
      i += 1
      continue
    }

    if (current === '--mode' || current === '--modo') {
      args.mode = argv[i + 1]
      i += 1
      continue
    }

    if (current === '--help' || current === '-h') {
      printHelp()
      process.exit(0)
    }

    fail(`Unknown argument: ${current}`)
  }

  return args
}

function normalizeMode(value) {
  if (!value) {
    return value
  }

  if (value === 'exemplo') {
    return 'example'
  }

  return value
}

function printHelp() {
  console.log(
    'Usage: node .claude/skills/module-aggregate/scripts/create-aggregate.js --module <module-name> --aggregate <aggregate-name> --mode <crud|example>',
  )
}

function materializeTemplate(templatePath, outputPath, replacements) {
  ensureFileExists(templatePath, `Template not found: ${templatePath}`)
  const template = fs.readFileSync(templatePath, 'utf8')
  const content = applyReplacements(template, replacements)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, ensureTrailingNewline(content))
}

function applyReplacements(template, replacements) {
  return Object.entries(replacements).reduce((content, [key, value]) => {
    return content.split(key).join(String(value))
  }, template)
}

function updateModuleIndex(indexPath, aggregateName) {
  const exportLine = `export * from './${aggregateName}'`
  const content = fs.readFileSync(indexPath, 'utf8')

  if (content.includes(exportLine)) {
    return
  }

  const normalized = content.trimEnd()
  const nextContent =
    normalized.length === 0 ? exportLine : `${normalized}\n\n${exportLine}`

  fs.writeFileSync(indexPath, `${nextContent}\n`)
}

function resolveSharedPackage(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'packages', 'shared', 'package.json')
  ensureFileExists(
    packageJsonPath,
    'Could not find packages/shared/package.json to resolve the shared package name.',
  )
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (!pkg.name || typeof pkg.name !== 'string') {
      fail('packages/shared/package.json does not contain a valid "name" field.')
    }
    return pkg.name
  } catch (error) {
    fail(`Failed to read packages/shared/package.json: ${error.message}`)
    return ''
  }
}

function toKebabCase(value) {
  return String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function toPascalCase(value) {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toCamelCase(value) {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function ensureTrailingNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}

function ensureDirectoryExists(targetPath, message) {
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    fail(message)
  }
}

function ensureFileExists(targetPath, message) {
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    fail(message)
  }
}

function log(message) {
  console.log(`[module-aggregate] ${message}`)
}

function fail(message) {
  console.error(`[module-aggregate] ${message}`)
  process.exit(1)
}

main()
