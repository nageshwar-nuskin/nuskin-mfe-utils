import type {
  ComposeRequest,
  GatewayBootstrap,
  RenderedSlot,
  GatewayManifest,
} from "@nuskin/gateway-contracts";

export function buildBootstrap(options: {
  requestId: string;
  request: ComposeRequest;
  renderedSlots: RenderedSlot[];
  slotStates: Map<string, unknown>;
  manifest: GatewayManifest;
}): GatewayBootstrap {
  const { requestId, request, renderedSlots, slotStates, manifest } = options;

  return {
    version: "1",
    requestId,
    url: request.url,
    shared: {
      locale: request.locale,
    },
    slots: renderedSlots.map((slot) => {
      const mfeEntry = manifest.mfes[slot.mfeId];
      const remoteEntry =
        mfeEntry?.federation?.client?.remoteEntry || "";

      return {
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: slot.mode,
        loaderId: slot.loaderId,
        state: slotStates.get(slot.loaderId),
        client: {
          remoteEntry,
          module: "./App",
        },
      };
    }),
  };
}

export function serializeBootstrapScript(
  bootstrap: GatewayBootstrap,
): string {
  const json = JSON.stringify(bootstrap).replace(/</g, "\\u003c");
  return `<script id="__MFE_GATEWAY__" type="application/json">${json}</script>`;
}
