import type {
  ComposeRequest,
  GatewayManifest,
  MfeManifestEntry,
} from "@nuskin/gateway-contracts";

function buildEntryFromOverride(
  mfeId: string,
  override: NonNullable<ComposeRequest["mfeRemoteConfig"]>[string],
  base?: MfeManifestEntry,
): MfeManifestEntry {
  return {
    id: mfeId,
    displayName: base?.displayName || mfeId,
    ssr: override.ssr ?? base?.ssr,
    slot: base?.slot || mfeId.replace(/_mfe$/, ""),
    critical: base?.critical,
    timeoutMs: base?.timeoutMs,
    federation: {
      name: base?.federation?.name || mfeId,
      exposes: base?.federation?.exposes,
      client: {
        remoteEntry:
          override.clientEntry ||
          base?.federation?.client?.remoteEntry ||
          "",
      },
      server: {
        remoteEntry:
          override.serverEntry ||
          base?.federation?.server?.remoteEntry ||
          "",
        entryGlobalName:
          base?.federation?.server?.entryGlobalName || mfeId,
      },
    },
    loadable: base?.loadable,
    fallback: base?.fallback,
  };
}

/**
 * Merges static manifest defaults with ContentStack-resolved remote URLs from storefront.
 */
export function mergeManifestWithRemoteConfig(
  manifest: GatewayManifest,
  remoteConfig?: ComposeRequest["mfeRemoteConfig"],
): GatewayManifest {
  if (!remoteConfig || Object.keys(remoteConfig).length === 0) {
    return manifest;
  }

  const mfes = { ...manifest.mfes };

  for (const [mfeId, override] of Object.entries(remoteConfig)) {
    if (!override) continue;
    const base = mfes[mfeId];
    mfes[mfeId] = buildEntryFromOverride(mfeId, override, base);
  }

  return { ...manifest, mfes };
}
