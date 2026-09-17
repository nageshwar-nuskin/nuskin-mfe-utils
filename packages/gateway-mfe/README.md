# @nuskin/gateway-mfe

**Install this package in each micro-frontend** — not in storefront, not as a standalone HTTP app.

Provides SSR helpers: federation load, `getServerSideProps`, `renderToString`, and the legacy `renderAndExtractContext` shape storefront already expects.

## Install (per MFE)

```bash
yarn add @nuskin/gateway-mfe @nuskin/gateway-contracts
```

Peer: `react`, `react-dom` ^18.2.

## Usage

```javascript
import { createMfeRenderer } from '@nuskin/gateway-mfe'
import App, { getServerSideProps } from '../App'

const { renderAndExtractContext } = createMfeRenderer({
  mfeId: 'header_mfe',
  uiExpose: 'App',
  federation: {
    serverRemoteEntry: 'https://cdn.example.com/header_mfe/server/remoteEntry.js',
    clientRemoteEntry: 'https://cdn.example.com/header_mfe/remoteEntry.js',
  },
  buildProps: ({ ctx, serverData }) => ({
    market: ctx.locale.market,
    language: ctx.locale.language,
    vbParams: serverData,
  }),
  stateGlobalName: '__HEADER_DATA__',
})

export { renderAndExtractContext }
```

Wire `renderAndExtractContext` into your existing MFE Express server (same as today). Storefront keeps calling **per-MFE SSR URLs** — no `POST /v1/render` central service.

### Local dev (inline module, no server remote)

```javascript
createMfeRenderer({
  mfeId: 'example_mfe',
  inlineModule: { default: App, getServerSideProps },
  buildProps: ({ serverData }) => serverData,
})
```

See [mfe-examples dev server](../mfe-examples/dev-server.mjs).

## API

| Export | Purpose |
|--------|---------|
| `createMfeRenderer` | Main factory → `renderAndExtractContext`, `renderServer`, `adapter` |
| `hostPayloadToRenderContext` | Map storefront/Express payload → `RenderContext` |
| `mfeRenderResultToLegacy` | `{ markup, dataScript }` for existing loaders |
| `renderMfeUi` / `renderMfeUiFromModule` | Lower-level SSR |

## Related

- [@nuskin/gateway-contracts](../gateway-contracts) — shared types
- [@nuskin/gateway-server](../gateway-server) — optional multi-slot `compose()` for tests only (no HTTP server)
