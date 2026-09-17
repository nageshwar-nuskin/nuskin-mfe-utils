import type { MfeAdapter } from "@nuskin/gateway-contracts";

const adapters = new Map<string, MfeAdapter>();

export function registerAdapter(mfeId: string, adapter: MfeAdapter): void {
  adapters.set(mfeId, adapter);
}

export function getRegisteredAdapter(mfeId: string): MfeAdapter | undefined {
  return adapters.get(mfeId);
}

export function listRegisteredAdapters(): string[] {
  return [...adapters.keys()];
}
