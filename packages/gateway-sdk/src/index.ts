import type { ComposeRequest, ComposeResponse } from "@nuskin/gateway-contracts";

export type { ComposeRequest, ComposeResponse };

export {
  buildComposeRequest,
  mapComposeToStorefrontApps,
} from "./storefront-bridge.js";
export type {
  StorefrontMfeAppConfig,
  StorefrontMfeAppResult,
} from "./storefront-bridge.js";

export interface GatewayClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export function createGatewayClient(options: GatewayClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const fetchFn = options.fetchImpl || fetch;

  return {
    async compose(request: ComposeRequest): Promise<ComposeResponse> {
      const response = await fetchFn(`${baseUrl}/v1/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          body.error || `Gateway compose failed (${response.status})`,
        );
      }

      return response.json() as Promise<ComposeResponse>;
    },

    async getManifest(): Promise<unknown> {
      const response = await fetchFn(`${baseUrl}/v1/manifest`);
      if (!response.ok) {
        throw new Error(`Failed to load manifest (${response.status})`);
      }
      return response.json();
    },
  };
}

/**
 * Builds slot HTML + bootstrap script for injection into storefront template.
 */
export function buildPageInjection(result: ComposeResponse): {
  slotsHtml: string;
  headTags: string;
  bootstrapScript: string;
} {
  const slotsHtml = result.slots
    .map(
      (slot) =>
        `<div id="mfe-slot-${slot.slotId}" data-mfe-slot="${slot.slotId}" data-mfe-id="${slot.mfeId}" data-mfe-mode="${slot.mode}" data-mfe-loader-id="${slot.loaderId}">${slot.html}</div>`,
    )
    .join("\n");

  return {
    slotsHtml,
    headTags: result.head,
    bootstrapScript: result.bootstrapScript,
  };
}
