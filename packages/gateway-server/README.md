# @nuskin/gateway-server

Optional **multi-slot compose** utilities for integration tests. **Not an HTTP service** — production and local dev use [`@nuskin/gateway-mfe`](../gateway-mfe) inside each MFE.

## Exports

```typescript
import { compose, registerAdapter, renderSlot, loadManifest } from "@nuskin/gateway-server";
```

`compose()` merges a manifest with `mfeRemoteConfig` and renders slots in parallel. Adapters in `src/adapters/registry.ts` delegate to `@nuskin/gateway-mfe` for SSR.

## When to use

- Automated tests for multi-MFE compose
- Platform experiments — **not** storefront production path

## Local dev

Run example MFEs instead:

```bash
yarn workspace @nuskin/mfe-examples dev   # :5510, gateway-mfe library
```

Sibling production MFEs: `yarn start` in header-mfe / site-visual-builder.
