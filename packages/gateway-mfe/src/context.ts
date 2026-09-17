import type { RenderContext } from "@nuskin/gateway-contracts";

/** Payload shape used by storefront / MFE Express SSR handlers. */
export interface HostSsrPayload {
  requestUrl?: string;
  market?: string;
  language?: string;
  params?: Record<string, unknown>;
  requestId?: string;
  host?: Record<string, unknown>;
}

export function hostPayloadToRenderContext(
  host: HostSsrPayload,
  options: { mfeId: string; slotId?: string },
): RenderContext {
  const url = host.requestUrl || "/";
  const market = (host.market || "us").toLowerCase();
  const language = (host.language || "en").toLowerCase();

  return {
    requestId: host.requestId || `mfe-${options.mfeId}`,
    url,
    locale: { market, language },
    params: { url, ...(host.params || {}) },
    host: host.host || {},
    slotId: options.slotId || options.mfeId.replace(/_mfe$/, ""),
  };
}
