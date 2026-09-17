import type { MfeAdapter, MfeManifestEntry } from "@nuskin/gateway-contracts";
import { getGatewayAdapter } from "../adapters/registry.js";
import { getRegisteredAdapter } from "./adapter-registry.js";

/**
 * Resolves the server adapter for an MFE.
 * Adapters live in the gateway — MFEs only expose render modules via federation.
 */
export async function loadServerAdapter(
  mfeId: string,
  entry: MfeManifestEntry,
): Promise<MfeAdapter | null> {
  const registered = getRegisteredAdapter(mfeId);
  if (registered) {
    return registered;
  }

  const gatewayAdapter = getGatewayAdapter(mfeId, entry);
  if (gatewayAdapter) {
    return gatewayAdapter;
  }

  if (process.env.GATEWAY_DEBUG === "true") {
    console.warn(
      `[gateway] No gateway adapter registered for "${mfeId}". Add one in src/adapters/registry.ts`,
    );
  }

  return null;
}
