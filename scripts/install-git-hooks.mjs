#!/usr/bin/env node
import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const gitDir = path.join(root, '.git')

if (!existsSync(gitDir)) {
  console.log('[install-git-hooks] No .git directory — skipped')
  process.exit(0)
}

const src = path.join(root, 'scripts/git-hooks/pre-commit')
const dest = path.join(gitDir, 'hooks/pre-commit')
mkdirSync(path.dirname(dest), { recursive: true })
copyFileSync(src, dest)
chmodSync(dest, 0o755)
console.log('[install-git-hooks] pre-commit hook installed')
