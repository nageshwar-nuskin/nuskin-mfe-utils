import type { MfeManifestEntry } from "@nuskin/gateway-contracts";

const REACT_VERSION = "18.2.0";

const initializedRemotes = new Set<string>();

function setupWebpackEnvironment(): void {
  const g = globalThis as typeof globalThis & {
    __webpack_require__?: () => Record<string, unknown>;
    __webpack_share_scopes__?: { default: Record<string, unknown> };
  };

  if (typeof g.__webpack_require__ === "undefined") {
    g.__webpack_require__ = () => ({});
  }

  if (typeof g.__webpack_share_scopes__ === "undefined") {
    g.__webpack_share_scopes__ = { default: {} };
  }
}

function ensureReactShared(): void {
  const g = globalThis as typeof globalThis & {
    __webpack_share_scopes__?: {
      default: Record<
        string,
        { 0: { get: () => Promise<() => unknown>; loaded: boolean } }
      >;
    };
  };

  if (!g.__webpack_share_scopes__?.default) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as unknown;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactDOM = require("react-dom") as unknown;

  g.__webpack_share_scopes__.default.react = {
    0: { get: () => Promise.resolve(() => React), loaded: true },
  };
  g.__webpack_share_scopes__.default["react-dom"] = {
    0: { get: () => Promise.resolve(() => ReactDOM), loaded: true },
  };
}

export async function ensureFederationRemote(
  mfeId: string,
  entry: MfeManifestEntry,
  hostName = "mfe-ssr-host",
): Promise<void> {
  const remoteEntry = entry.federation?.server?.remoteEntry;
  if (!remoteEntry) {
    throw new Error(`No server remoteEntry for ${mfeId}`);
  }

  if (initializedRemotes.has(mfeId)) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { init } = require("@module-federation/runtime") as {
    init: (options: unknown) => Promise<void>;
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeRuntimePluginModule = require("@module-federation/node/runtimePlugin");
  const nodeRuntimePlugin =
    (nodeRuntimePluginModule as { default?: unknown }).default ??
    nodeRuntimePluginModule;

  setupWebpackEnvironment();
  ensureReactShared();

  await init({
    name: hostName,
    remotes: [{ name: mfeId, entry: remoteEntry, alias: mfeId }],
    cacheStrategy: "no-cache",
    cacheGroups: { default: { maxAge: 0 } },
    shared: {
      react: {
        singleton: true,
        eager: true,
        requiredVersion: REACT_VERSION,
        strictVersion: true,
      },
      "react-dom": {
        singleton: true,
        eager: true,
        requiredVersion: REACT_VERSION,
        strictVersion: true,
      },
    },
    plugins: [nodeRuntimePlugin as never],
  });

  initializedRemotes.add(mfeId);
}

export async function loadRemoteModule<T = Record<string, unknown>>(
  mfeId: string,
  expose: string,
  entry: MfeManifestEntry,
  hostName?: string,
): Promise<T> {
  await ensureFederationRemote(mfeId, entry, hostName);

  const exposeKey = expose.replace(/^\.\//, "");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { loadRemote } = require("@module-federation/runtime") as {
    loadRemote: (id: string) => Promise<unknown>;
  };

  const remote = await loadRemote(`${mfeId}/${exposeKey}`);
  const mod = remote as Record<string, unknown>;

  if (typeof remote === "function") {
    return remote as T;
  }

  const named = mod[exposeKey] ?? mod.default ?? mod;
  return named as T;
}
