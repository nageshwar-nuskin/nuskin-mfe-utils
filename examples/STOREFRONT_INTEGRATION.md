# Example MFE integration

How to run the demos in this repo and copy the same SSR contract into a real MFE.

SSR lives in **each MFE** via [`@nuskin/gateway-mfe`](../packages/gateway-mfe). This repo does **not** ship a `POST /v1/render` service.

## 1. Run the demos here

```bash
yarn install
yarn build
yarn dev
```

That starts [`@nuskin/mfe-examples`](../packages/mfe-examples/) on port **5510**.

| Demo | `mfeId` | What it shows |
|------|---------|----------------|
| Minimal | `example_mfe` | `getServerSideProps` → greeting markup |
| Complex | `complex_demo_mfe` | Catalog state, `getSEOTags`, SSR + hydrate |

```bash
curl -s 'http://localhost:5510/ssr/example_mfe?url=/us/en/demo'
curl -s 'http://localhost:5510/preview/complex_demo_mfe?url=/us/en/catalog/skincare'
```

The JSON shape is `{ markup, dataScript, head }` from `renderAndExtractContext`.

## 2. Copy this into a real MFE

Install the library, expose `./App`, and wrap SSR with `createMfeRenderer`.

```javascript
import { createMfeRenderer } from '@nuskin/gateway-mfe'
import App, { getServerSideProps } from '../App'

const { renderAndExtractContext } = createMfeRenderer({
  mfeId: 'example_mfe',
  inlineModule: { default: App, getServerSideProps },
  buildProps: ({ ctx, serverData }) => ({
    ...serverData,
    url: ctx.url,
  }),
  stateGlobalName: '__EXAMPLE_MFE_DATA__',
})

export { renderAndExtractContext }
```

Production builds can pass `federation.serverRemoteEntry` instead of `inlineModule`. See [packages/gateway-mfe/README.md](../packages/gateway-mfe/README.md).

### Federation

| Item | Value |
|------|--------|
| Federation `name` | Same as host `app_name` (demos: `example_mfe`, `complex_demo_mfe`) |
| Expose | `./App` |
| Optional | `getServerSideProps`, `getSEOTags` on the same module |

### Host wiring (any host, including storefront)

The host still calls **this MFE’s** SSR URL (or inlines the library in local dev). Typical pieces:

1. Content config with client `remoteEntry` and the federation `component` (`App`).
2. A loader that hydrates from `markup` + `dataScript`.
3. Optional `isToEnableSSR` on that loader.

Do not add a central `enableRenderGateway` / `renderGatewayUrl` flag for these examples — that path is not part of this repo.

Example loader usage:

```jsx
<MicroFrontendLoader
  loaderId="mfe-loader-0-example_mfe"
  remoteConfig={{ appName: 'example_mfe', component: 'App' }}
  params={{ url: '/us/en/demo' }}
  isToEnableSSR={true}
/>
```

## 3. What each demo exports

### `example_mfe`

| Export | Role |
|--------|------|
| `getServerSideProps` | `{ greeting, renderedAt }` |
| `App` | Banner that prints `greeting` |

Payload: [ssr-example-mfe.json](./ssr-example-mfe.json).

### `complex_demo_mfe`

| Export | Role |
|--------|------|
| `getServerSideProps` | `{ initialState, seo, url, isPageFound }` |
| `getSEOTags` | title, meta, canonical, OG, JSON-LD |
| `App` | `CatalogProvider` + interactive grid |

Payload: [ssr-complex-demo-mfe.json](./ssr-complex-demo-mfe.json).

`createMfeRenderer` maps `getSEOTags` into `head` and serializes props into `dataScript` (`__COMPLEX_DEMO_MFE_DATA__`).

## 4. Optional standalone sandboxes

[`minimal-mfe`](./minimal-mfe/) and [`complex-mfe`](./complex-mfe/) only serve webpack remotes. They do not run `@nuskin/gateway-mfe`. Prefer `packages/mfe-examples` unless you are debugging federation output in isolation.

## New MFE checklist

1. Expose `./App` (optional `getServerSideProps` / `getSEOTags`).
2. Call `createMfeRenderer` from the MFE server bundle.
3. Point the host loader at this MFE’s client `remoteEntry` and SSR handler.
4. Verify with `GET /ssr/<mfeId>` (or the MFE’s existing SSR route), then hydrate in the host.
