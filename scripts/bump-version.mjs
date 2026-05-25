#!/usr/bin/env node
/**
 * Increments package.json patch version and syncs src/generated/appVersion.js.
 * Invoked automatically by the git pre-commit hook.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = path.join(root, 'package.json')
const genPath = path.join(root, 'src/generated/appVersion.js')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const parts = String(pkg.version || '0.0.0')
  .trim()
  .split('.')
  .map((n) => Number.parseInt(n, 10))

if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
  console.error('[bump-version] package.json version must be semver MAJOR.MINOR.PATCH')
  process.exit(1)
}

parts[2] += 1
const next = parts.join('.')
pkg.version = next

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
writeFileSync(
  genPath,
  `/** Auto-updated by scripts/bump-version.mjs on each git commit */\nexport const APP_VERSION = '${next}'\n`,
)

console.log(`[bump-version] ${next}`)
