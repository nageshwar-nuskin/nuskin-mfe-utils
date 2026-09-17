import type {
  MfeAdapter,
  MfeManifestEntry,
  MfeRenderResult,
  RenderContext,
} from "@nuskin/gateway-contracts";
import { hostPayloadToRenderContext, type HostSsrPayload } from "./context.js";
import { mfeRenderResultToLegacy, type RenderAndExtractContextResult } from "./legacy.js";
import {
  renderMfeUi,
  renderMfeUiFromModule,
  type BuildUiProps,
  type MfeUiModuleShape,
} from "./render-ui.js";

export interface MfeRendererFederationConfig {
  serverRemoteEntry: string;
  clientRemoteEntry?: string;
  entryGlobalName?: string;
}

export interface CreateMfeRendererOptions {
  mfeId: string;
  uiExpose?: string;
  buildProps: BuildUiProps;
  /** Federation server remote (production / built dist). */
  federation?: MfeRendererFederationConfig;
  /** In-process module — local dev without server remote fetch. */
  inlineModule?: MfeUiModuleShape;
  federationHostName?: string;
  stateGlobalName?: string;
}

function toManifestEntry(
  mfeId: string,
  federation?: MfeRendererFederationConfig,
): MfeManifestEntry {
  return {
    id: mfeId,
    displayName: mfeId,
    ssr: true,
    slot: mfeId,
    federation: {
      name: federation?.entryGlobalName || mfeId,
      client: federation?.clientRemoteEntry
        ? { remoteEntry: federation.clientRemoteEntry }
        : undefined,
      server: {
        remoteEntry: federation?.serverRemoteEntry || "",
        entryGlobalName: federation?.entryGlobalName || mfeId,
      },
    },
  };
}

/**
 * Per-MFE SSR renderer — install in each MFE repo, export from server bundle.
 */
export function createMfeRenderer(options: CreateMfeRendererOptions) {
  const {
    mfeId,
    uiExpose = "App",
    buildProps,
    federation,
    inlineModule,
    federationHostName,
    stateGlobalName,
  } = options;

  const entry = federation ? toManifestEntry(mfeId, federation) : null;

  async function renderServer(ctx: RenderContext): Promise<MfeRenderResult> {
    if (inlineModule) {
      return renderMfeUiFromModule({
        mfeId,
        module: inlineModule,
        ctx,
        buildProps,
      });
    }
    if (!entry?.federation?.server?.remoteEntry) {
      throw new Error(
        `${mfeId}: provide federation.serverRemoteEntry or inlineModule`,
      );
    }
    return renderMfeUi({
      mfeId,
      entry,
      uiExpose,
      ctx,
      buildProps,
      federationHostName,
    });
  }

  async function renderAndExtractContext(
    host: HostSsrPayload,
  ): Promise<RenderAndExtractContextResult> {
    const ctx = hostPayloadToRenderContext(host, { mfeId });
    const result = await renderServer(ctx);
    return mfeRenderResultToLegacy(result, { stateGlobalName });
  }

  const adapter: MfeAdapter = { renderServer };

  return {
    mfeId,
    adapter,
    renderServer,
    renderAndExtractContext,
  };
}

/** Same as createGenericUiAdapter — factory for federation-based MFEs. */
export function createGenericMfeRenderer(
  config: Omit<CreateMfeRendererOptions, "inlineModule"> & {
    federation: MfeRendererFederationConfig;
  },
) {
  return createMfeRenderer(config);
}
