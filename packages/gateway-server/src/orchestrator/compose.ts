import { randomUUID } from "node:crypto";
import type {
  ComposeRequest,
  ComposeResponse,
} from "@nuskin/gateway-contracts";
import {
  buildBootstrap,
  serializeBootstrapScript,
} from "../bootstrap/serialize-payload.js";
import { loadManifest } from "../registry/manifest-loader.js";
import { mergeManifestWithRemoteConfig } from "../registry/manifest-merge.js";
import { composeHeadTags } from "./html-composer.js";
import { renderSlot } from "./slot-renderer.js";

export async function compose(
  request: ComposeRequest,
): Promise<ComposeResponse> {
  const requestId = request.requestId || randomUUID();
  const baseManifest = await loadManifest();
  const manifest = mergeManifestWithRemoteConfig(
    baseManifest,
    request.mfeRemoteConfig,
  );
  const slotStates = new Map<string, unknown>();
  const diagnostics: ComposeResponse["diagnostics"] = { errors: [] };

  const outcomes = await Promise.all(
    request.slots.map((slot, index) =>
      renderSlot({
        request: { ...request, requestId },
        requestId,
        manifest,
        slot,
        index,
      }),
    ),
  );

  const renderedSlots = outcomes.map((outcome) => {
    if (outcome.state !== undefined) {
      slotStates.set(outcome.slot.loaderId, outcome.state);
    }
    if (outcome.diagnostics) {
      diagnostics.errors.push({
        mfeId: outcome.slot.mfeId,
        slotId: outcome.slot.slotId,
        phase: outcome.diagnostics.phase,
        message: outcome.diagnostics.message,
      });
    }
    return outcome.slot;
  });

  const bootstrap = buildBootstrap({
    requestId,
    request,
    renderedSlots,
    slotStates,
    manifest,
  });

  return {
    requestId,
    slots: renderedSlots,
    head: composeHeadTags(renderedSlots),
    bootstrap,
    bootstrapScript: serializeBootstrapScript(bootstrap),
    diagnostics,
  };
}
