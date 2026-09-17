import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GatewayManifest } from "@nuskin/gateway-contracts";

let cachedManifest: GatewayManifest | null = null;

function defaultManifestPath(): string {
  return path.resolve(
    process.cwd(),
    process.env.GATEWAY_MANIFEST_PATH || "../../manifests/manifest.dev.json",
  );
}

export async function loadManifest(
  manifestPath?: string,
): Promise<GatewayManifest> {
  if (cachedManifest && !manifestPath) {
    return cachedManifest;
  }

  const resolvedPath = manifestPath || defaultManifestPath();

  const raw = await readFile(resolvedPath, "utf8");
  const manifest = JSON.parse(raw) as GatewayManifest;
  cachedManifest = manifest;
  return manifest;
}

export function clearManifestCache(): void {
  cachedManifest = null;
}

export function getMfeEntry(
  manifest: GatewayManifest,
  mfeId: string,
) {
  return manifest.mfes[mfeId] ?? null;
}
