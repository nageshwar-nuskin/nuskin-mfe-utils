import type { GatewayBootstrap } from "./types.js";

type MfeAdapter = {
  hydrateClient?: (
    el: HTMLElement,
    ctx: unknown,
    state?: unknown,
  ) => void | Promise<void>;
  mountClient?: (el: HTMLElement, ctx: unknown) => void | Promise<void>;
};

declare global {
  interface Window {
    __webpack_share_scopes__?: Record<string, unknown>;
  }
}

const adapterCache = new Map<string, MfeAdapter>();

async function ensureRemoteLoaded(
  slot: GatewayBootstrap["slots"][number],
): Promise<void> {
  const remoteEntry = slot.client?.remoteEntry;
  if (!remoteEntry) {
    throw new Error(`No remoteEntry for ${slot.mfeId}`);
  }

  // @module-federation/runtime is expected to be provided by the host (storefront)
  const runtime = (window as Window & {
    __FEDERATION__?: {
      init?: (args: unknown) => void;
      loadRemote?: (id: string) => Promise<unknown>;
    };
  }).__FEDERATION__;

  if (runtime?.loadRemote) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = remoteEntry;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load remoteEntry: ${remoteEntry}`));
    document.head.appendChild(script);
  });
}

export async function loadRemoteAdapter(
  slot: GatewayBootstrap["slots"][number],
): Promise<MfeAdapter | null> {
  const cacheKey = `${slot.mfeId}:${slot.client.module}`;
  if (adapterCache.has(cacheKey)) {
    return adapterCache.get(cacheKey) || null;
  }

  try {
    await ensureRemoteLoaded(slot);

    const federation = (window as Window & {
      __FEDERATION__?: { loadRemote?: (id: string) => Promise<unknown> };
    }).__FEDERATION__;

    if (!federation?.loadRemote) {
      console.warn(
        "[gateway-runtime] Module Federation runtime not found on window.__FEDERATION__",
      );
      return null;
    }

    const moduleName = (slot.client?.module || "./App").replace(/^\.\//, "");
    const remoteId = `${slot.mfeId}/${moduleName}`;
    const module = (await federation.loadRemote(remoteId)) as {
      default?: MfeAdapter;
      adapter?: MfeAdapter;
    };

    const adapter = module?.default || module?.adapter || (module as MfeAdapter);
    adapterCache.set(cacheKey, adapter);
    return adapter;
  } catch (error) {
    console.error(`[gateway-runtime] Failed to load ${slot.mfeId}`, error);
    return null;
  }
}
