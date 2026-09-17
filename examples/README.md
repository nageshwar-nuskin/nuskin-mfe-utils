# Examples

Demo MFEs live in **`packages/mfe-examples`** (library) — not separate dev servers.

## Local dev (one process for examples)

```bash
# Builds example client bundles + starts gateway on :3100
yarn dev
```

| What | URL |
|------|-----|
| Gateway API | http://localhost:3100 |
| Example client `remoteEntry` | http://localhost:3100/mfe-assets/example_mfe/remoteEntry.js |
| Complex client `remoteEntry` | http://localhost:3100/mfe-assets/complex_demo_mfe/remoteEntry.js |

**SSR** for `example_mfe` / `complex_demo_mfe` uses inline imports (no port 5510/5512).

**With storefront:** run gateway + storefront (2 apps). Production MFEs (header, SVB) still use their own ports when testing federation.

## Packages

| Package | Purpose |
|---------|---------|
| [@nuskin/mfe-examples](../packages/mfe-examples/) | Source + client webpack build |
| [minimal-mfe](./minimal-mfe/) | Optional standalone federation sandbox |
| [complex-mfe](./complex-mfe/) | Optional standalone federation sandbox |

## Compose payloads

| File | MFE |
|------|-----|
| [compose-example-mfe.json](./compose-example-mfe.json) | `example_mfe` |
| [compose-complex-demo-mfe.json](./compose-complex-demo-mfe.json) | `complex_demo_mfe` (+ SEO/state) |
| [compose-header-only.json](./compose-header-only.json) | `header_mfe` (needs header on :5501) |

See [STOREFRONT_INTEGRATION.md](./STOREFRONT_INTEGRATION.md).
