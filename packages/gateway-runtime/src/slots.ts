import type { GatewayBootstrap, RenderContext } from "./types.js";
import { loadRemoteAdapter } from "./federation.js";

function buildContext(
  bootstrap: GatewayBootstrap,
  slot: GatewayBootstrap["slots"][number],
): RenderContext {
  return {
    requestId: bootstrap.requestId,
    url: bootstrap.url,
    locale: bootstrap.shared.locale,
    params: {},
    host: {},
    slotId: slot.slotId,
  };
}

function getSlotElement(loaderId: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(
    `[data-mfe-loader-id="${loaderId}"]`,
  );
  return el;
}

export async function hydrateSlots(
  bootstrap: GatewayBootstrap,
): Promise<void> {
  const ssrSlots = bootstrap.slots.filter((s) => s.mode === "ssr");

  await Promise.all(
    ssrSlots.map(async (slot) => {
      const el = getSlotElement(slot.loaderId);
      if (!el) {
        console.warn(
          `[gateway-runtime] SSR slot element not found: ${slot.loaderId}`,
        );
        return;
      }

      const ctx = buildContext(bootstrap, slot);
      const adapter = await loadRemoteAdapter(slot);

      if (adapter?.hydrateClient) {
        await adapter.hydrateClient(el, ctx, slot.state);
        return;
      }

      console.warn(
        `[gateway-runtime] No hydrateClient for ${slot.mfeId}; slot left as SSR HTML`,
      );
    }),
  );
}

export async function mountSlots(bootstrap: GatewayBootstrap): Promise<void> {
  const csrSlots = bootstrap.slots.filter(
    (s) => s.mode === "csr" || s.mode === "fallback",
  );

  await Promise.all(
    csrSlots.map(async (slot) => {
      const el = getSlotElement(slot.loaderId);
      if (!el) {
        console.warn(
          `[gateway-runtime] CSR slot element not found: ${slot.loaderId}`,
        );
        return;
      }

      const ctx = buildContext(bootstrap, slot);
      const adapter = await loadRemoteAdapter(slot);

      if (adapter?.mountClient) {
        await adapter.mountClient(el, ctx);
        return;
      }

      console.warn(
        `[gateway-runtime] No mountClient for ${slot.mfeId}`,
      );
    }),
  );
}
