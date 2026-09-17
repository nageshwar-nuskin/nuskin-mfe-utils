import type { GatewayBootstrap, RenderContext } from "./types.js";
import { hydrateSlots, mountSlots } from "./slots.js";

export type { GatewayBootstrap, RenderContext };

export function readBootstrap(): GatewayBootstrap | null {
  const el = document.getElementById("__MFE_GATEWAY__");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as GatewayBootstrap;
  } catch {
    console.error("[gateway-runtime] Failed to parse __MFE_GATEWAY__");
    return null;
  }
}

export async function bootstrapMfeSlots(
  bootstrap?: GatewayBootstrap,
): Promise<void> {
  const payload = bootstrap || readBootstrap();
  if (!payload) {
    console.warn("[gateway-runtime] No bootstrap payload found");
    return;
  }

  await Promise.all([
    hydrateSlots(payload),
    mountSlots(payload),
  ]);
}

if (typeof window !== "undefined") {
  (window as Window & { __MFE_GATEWAY_RUNTIME__?: unknown }).__MFE_GATEWAY_RUNTIME__ =
    { readBootstrap, bootstrapMfeSlots };
}
