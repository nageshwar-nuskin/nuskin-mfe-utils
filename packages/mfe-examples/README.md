# @nuskin/mfe-examples

Example MFEs as a **library + local dev server**. No gateway process on port 3100.

| Concern | How |
|---------|-----|
| **SSR** | `createMfeRenderer` + `inlineModule` (`src/server/renderers.js`) |
| **Client** | Webpack builds `remoteEntry.js` under `dist/static/{mfeId}/` |
| **Local dev** | `yarn dev` from repo root → **http://localhost:5510** |

## Run

```bash
yarn workspace @nuskin/mfe-examples build
yarn workspace @nuskin/mfe-examples dev
```

From the monorepo root, `yarn build && yarn dev` does the same.

| Route | Purpose |
|-------|---------|
| `GET /health` | Process check |
| `GET /static/example_mfe/remoteEntry.js` | Minimal client remote |
| `GET /static/complex_demo_mfe/remoteEntry.js` | Catalog client remote |
| `GET /ssr/:mfeId` | `renderAndExtractContext` JSON |
| `GET /preview/:mfeId` | HTML page with `markup` + `dataScript` + `head` |

```bash
curl -s 'http://localhost:5510/ssr/example_mfe?url=/us/en/demo'
curl -s 'http://localhost:5510/ssr/complex_demo_mfe?url=/us/en/catalog/skincare&customerTier=gold'
curl -s 'http://localhost:5510/preview/complex_demo_mfe?url=/us/en/catalog/skincare&customerTier=gold'
```

## Build

```bash
yarn workspace @nuskin/mfe-examples build
```

Output:

- `dist/index.js` — modules for inline SSR
- `dist/static/example_mfe/remoteEntry.js`
- `dist/static/complex_demo_mfe/remoteEntry.js`

## Exports

| Export | MFE id |
|--------|--------|
| `exampleMfeApp` | `example_mfe` |
| `complexDemoMfeApp` | `complex_demo_mfe` (+ `getSEOTags`) |

## Standalone federation folders

`examples/minimal-mfe` and `examples/complex-mfe` are optional webpack sandboxes. They do not run this package’s SSR server.
