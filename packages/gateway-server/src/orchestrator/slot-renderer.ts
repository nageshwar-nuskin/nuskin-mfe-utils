import type {
  ComposeRequest,
  GatewayManifest,
  MfeManifestEntry,
  RenderContext,
  RenderedSlot,
  SlotRequest,
} from "@nuskin/gateway-contracts";
import { loadServerAdapter } from "../loader/federation-loader.js";
import { buildLoaderId } from "../utils/ids.js";
import { withTimeout } from "../utils/timeout.js";
import { resolveSsr } from "./resolve-ssr.js";

export interface SlotRenderOutcome {
  slot: RenderedSlot;
  state?: unknown;
  diagnostics?: {
    phase: string;
    message: string;
  };
}

function renderPlaceholder(slotId: string, mfeId: string): string {
  return `<div data-mfe-placeholder data-mfe-id="${mfeId}" data-mfe-slot="${slotId}"></div>`;
}

function buildRenderContext(options: {
  request: ComposeRequest;
  requestId: string;
  slot: SlotRequest;
}): RenderContext {
  const { request, requestId, slot } = options;
  return {
    requestId,
    url: request.url,
    locale: request.locale,
    params: slot.params || {},
    host: request.hostContext || {},
    slotId: slot.slotId,
  };
}

export async function renderSlot(options: {
  request: ComposeRequest;
  requestId: string;
  manifest: GatewayManifest;
  slot: SlotRequest;
  index: number;
}): Promise<SlotRenderOutcome> {
  const { request, requestId, manifest, slot, index } = options;
  const mfeEntry = manifest.mfes[slot.mfeId];
  const loaderId = buildLoaderId({ index: slot.loaderIndex ?? index, mfeId: slot.mfeId });

  if (!mfeEntry) {
    return {
      slot: {
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: "fallback",
        loaderId,
        html: `<div data-mfe-error>Unknown MFE: ${slot.mfeId}</div>`,
        error: { message: `Unknown MFE: ${slot.mfeId}`, phase: "manifest" },
      },
      diagnostics: {
        phase: "manifest",
        message: `Unknown MFE: ${slot.mfeId}`,
      },
    };
  }

  const useSsr = resolveSsr({ manifest, mfeEntry, slot });
  const ctx = buildRenderContext({ request, requestId, slot });

  if (!useSsr) {
    return {
      slot: {
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: "csr",
        loaderId,
        html: renderPlaceholder(slot.slotId, slot.mfeId),
      },
    };
  }

  return renderSsrSlot({
    ctx,
    loaderId,
    slot,
    mfeEntry,
    manifest,
  });
}

async function renderSsrSlot(options: {
  ctx: RenderContext;
  loaderId: string;
  slot: SlotRequest;
  mfeEntry: MfeManifestEntry;
  manifest: GatewayManifest;
}): Promise<SlotRenderOutcome> {
  const { ctx, loaderId, slot, mfeEntry, manifest } = options;
  const timeoutMs =
    mfeEntry.timeoutMs ?? manifest.defaults?.timeoutMs ?? 8000;

  try {
    const adapter = await loadServerAdapter(slot.mfeId, mfeEntry);

    if (!adapter?.renderServer) {
      throw new Error(
        `No server adapter available for ${slot.mfeId} (register locally or enable federation loader)`,
      );
    }

    const result = await withTimeout(
      adapter.renderServer(ctx),
      timeoutMs,
      slot.mfeId,
    );

    return {
      slot: {
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: "ssr",
        loaderId,
        html: result.html,
        head: result.head,
        assets: result.assets,
      },
      state: result.state,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SSR render failed";

    if (mfeEntry.fallback?.csrOnSsrFailure) {
      return {
        slot: {
          slotId: slot.slotId,
          mfeId: slot.mfeId,
          mode: "csr",
          loaderId,
          html:
            mfeEntry.fallback?.html ||
            renderPlaceholder(slot.slotId, slot.mfeId),
          error: { message, phase: "renderServer" },
        },
        diagnostics: { phase: "renderServer", message },
      };
    }

    return {
      slot: {
        slotId: slot.slotId,
        mfeId: slot.mfeId,
        mode: "fallback",
        loaderId,
        html:
          mfeEntry.fallback?.html ||
          `<div data-mfe-error>${slot.mfeId} unavailable</div>`,
        error: { message, phase: "renderServer" },
      },
      diagnostics: { phase: "renderServer", message },
    };
  }
}
