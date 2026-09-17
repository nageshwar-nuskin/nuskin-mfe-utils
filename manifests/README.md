# Gateway manifests

| File | Purpose |
|------|---------|
| [manifest.dev.json](./manifest.dev.json) | MFE slots, SSR defaults, federation URLs (`/mfe-assets/` on gateway) |
| [mfe-asset-paths.dev.json](./mfe-asset-paths.dev.json) | Where built artifacts live on disk (sibling repos) |

After changing asset paths, run:

```bash
node scripts/apply-gateway-manifest-urls.js
```

See [root README — Single runtime](../README.md#single-runtime-local-dev).
