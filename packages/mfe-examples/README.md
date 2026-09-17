# @nuskin/mfe-examples

Example MFEs as a **library** — no separate ports `5510` / `5512`.

| Concern | How |
|---------|-----|
| **SSR** | Gateway imports this package directly (`createInlineUiAdapter`) |
| **Client** | Webpack builds `remoteEntry.js` → gateway serves `/mfe-assets/{mfeId}/` |
| **Local dev** | Run **gateway only** (`yarn dev` from repo root after build) |

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

## Legacy standalone servers

The folders `examples/minimal-mfe` and `examples/complex-mfe` are optional — only needed to test federation in isolation. Prefer this package for day-to-day gateway development.
