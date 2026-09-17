# complex-mfe (federation sandbox)

**Prefer [`@nuskin/mfe-examples`](../../packages/mfe-examples/)** — source of truth for `complex_demo_mfe` (SSR, SEO, catalog state).

```bash
yarn dev   # from repo root — http://localhost:5510/preview/complex_demo_mfe
```

This folder only builds and serves webpack remotes. It does **not** call `@nuskin/gateway-mfe`. Keep `App.jsx` in sync with `packages/mfe-examples/src/complex/App.jsx`.

```bash
yarn install && yarn build && yarn start   # port 5512
```

| Asset | URL |
|-------|-----|
| Client `remoteEntry` | http://localhost:5512/static/remoteEntry.js |
| Server `remoteEntry` | http://localhost:5512/static/server/remoteEntry.js |
