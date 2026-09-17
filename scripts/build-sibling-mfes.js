#!/usr/bin/env node
/**
 * Build federation artifacts for sibling MFE repos (no long-running servers).
 * Run from mfe-utils root.
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const siblings = [
  { name: 'header-mfe', cmd: 'yarn build:local', check: 'dist/server/remoteEntry.js' },
  {
    name: 'site-visual-builder',
    cmd: 'yarn build:local',
    check: 'dist/server/remoteEntry.js',
  },
]

let failed = false

for (const { name, cmd, check } of siblings) {
  const dir = path.join(root, '..', name)
  if (!fs.existsSync(dir)) {
    console.warn(`[skip] ${name} not found at ${dir}`)
    continue
  }
  console.log(`\n=== Building ${name} ===`)
  try {
    execSync(cmd, { cwd: dir, stdio: 'inherit' })
    const artifact = path.join(dir, check)
    if (!fs.existsSync(artifact)) {
      console.error(`[fail] Expected artifact missing: ${artifact}`)
      failed = true
    } else {
      console.log(`[ok] ${artifact}`)
    }
  } catch (e) {
    console.error(`[fail] ${name}:`, e.message)
    failed = true
  }
}

console.log('\n=== @nuskin/mfe-examples ===')
execSync('yarn workspace @nuskin/mfe-examples build', { cwd: root, stdio: 'inherit' })

if (failed) {
  process.exit(1)
}

console.log('\nDone. Start gateway only: yarn dev')
