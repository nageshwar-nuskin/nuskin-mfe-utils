#!/usr/bin/env node
/**
 * Rewrites manifest.dev.json federation URLs to gateway /mfe-assets/ (single runtime).
 */
const fs = require('fs')
const path = require('path')

const manifestPath = path.join(__dirname, '../manifests/manifest.dev.json')
const assetPathsPath = path.join(__dirname, '../manifests/mfe-asset-paths.dev.json')

const port = process.env.PORT || '3100'
const base = process.env.GATEWAY_PUBLIC_URL || `http://localhost:${port}`

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const assetPaths = JSON.parse(fs.readFileSync(assetPathsPath, 'utf8'))

for (const mfeId of Object.keys(manifest.mfes || {})) {
  const entry = manifest.mfes[mfeId]
  if (!entry?.federation) continue

  entry.federation.client = entry.federation.client || {}
  entry.federation.server = entry.federation.server || {}
  entry.federation.client.remoteEntry = `${base}/mfe-assets/${mfeId}/remoteEntry.js`
  entry.federation.server.remoteEntry = `${base}/mfe-assets/${mfeId}/server/remoteEntry.js`

  if (entry.loadable && mfeId === 'site_visual_builder') {
    entry.loadable.clientStats = `${base}/mfe-assets/${mfeId}/loadable-stats.json`
    entry.loadable.serverStats = `${base}/mfe-assets/${mfeId}/server/loadable-stats.json`
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Updated ${manifestPath} → ${base}/mfe-assets/*`)
