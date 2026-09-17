# Examples

Source of truth: **[`packages/mfe-examples`](../packages/mfe-examples/)**.

SSR uses `@nuskin/gateway-mfe` in-process (`createMfeRenderer` + `inlineModule`). There is **no** HTTP gateway on port 3100 and **no** `/mfe-assets` or `POST /v1/render`.

## Local dev

```bash
yarn install
yarn build
yarn dev
```

`yarn dev` starts `@nuskin/mfe-examples` on **http://localhost:5510**.

| What | URL |
|------|-----|
| Health | http://localhost:5510/health |
| Example client `remoteEntry` | http://localhost:5510/static/example_mfe/remoteEntry.js |
| Complex client `remoteEntry` | http://localhost:5510/static/complex_demo_mfe/remoteEntry.js |
| SSR JSON | http://localhost:5510/ssr/example_mfe?url=/us/en/demo |
| HTML preview | http://localhost:5510/preview/complex_demo_mfe?url=/us/en/catalog/skincare |

```bash
curl -s 'http://localhost:5510/ssr/example_mfe?url=/us/en/demo&market=us&language=en'
curl -s 'http://localhost:5510/ssr/complex_demo_mfe?url=/us/en/catalog/skincare&customerTier=gold'
curl -s 'http://localhost:5510/preview/example_mfe?url=/us/en/demo'
```

Sample `renderAndExtractContext` payloads: [ssr-example-mfe.json](./ssr-example-mfe.json), [ssr-complex-demo-mfe.json](./ssr-complex-demo-mfe.json).

## Packages

| Path | Purpose |
|------|---------|
| [@nuskin/mfe-examples](../packages/mfe-examples/) | Demo MFEs + SSR + client federation (use this) |
| [minimal-mfe](./minimal-mfe/) | Optional webpack remote sandbox (static only, port 5510) |
| [complex-mfe](./complex-mfe/) | Optional webpack remote sandbox (static only, port 5512) |

Do not run `yarn dev` and `examples/minimal-mfe` at the same time — both default to port 5510.

See [STOREFRONT_INTEGRATION.md](./STOREFRONT_INTEGRATION.md) for copying the pattern into a real MFE.
