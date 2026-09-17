import type {
  GatewayManifest,
  MfeManifestEntry,
  SlotRequest,
} from "@nuskin/gateway-contracts";

export function resolveSsr(options: {
  manifest: GatewayManifest;
  mfeEntry: MfeManifestEntry;
  slot: SlotRequest;
}): boolean {
  const { manifest, mfeEntry, slot } = options;

  if (typeof slot.ssr === "boolean") {
    return slot.ssr;
  }

  if (typeof mfeEntry.ssr === "boolean") {
    return mfeEntry.ssr;
  }

  return manifest.defaults?.ssr ?? false;
}
