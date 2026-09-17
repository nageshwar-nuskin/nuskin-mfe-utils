# minimal-mfe (federation sandbox)

**Prefer [`@nuskin/mfe-examples`](../../packages/mfe-examples/)** for day-to-day work.

```bash
yarn dev   # from repo root — SSR + client remotes on :5510
```

This folder only builds and serves webpack remotes. It does **not** call `@nuskin/gateway-mfe`.

```bash
yarn install && yarn build && yarn start   # port 5510
```

| Asset | URL |
|-------|-----|
| Client `remoteEntry` | http://localhost:5510/static/remoteEntry.js |
| Server `remoteEntry` | http://localhost:5510/static/server/remoteEntry.js |

That port collides with `yarn dev`. Set `EXAMPLE_MFE_PORT` if you need both.
