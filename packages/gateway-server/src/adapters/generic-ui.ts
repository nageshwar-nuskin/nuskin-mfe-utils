import type { MfeAdapter, MfeManifestEntry } from "@nuskin/gateway-contracts";
import { renderMfeUi, type BuildUiProps } from "./render-ui.js";

export interface GenericUiAdapterConfig {
  mfeId: string;
  /** Federation expose name without ./ (default: App) */
  uiExpose?: string;
  buildProps: BuildUiProps;
}

/**
 * Factory for standard MFEs: UI module + optional getServerSideProps on same file.
 * Use for new MFEs that follow the header_mfe / site_visual_builder pattern.
 */
export function createGenericUiAdapter(
  config: GenericUiAdapterConfig,
): (entry: MfeManifestEntry) => MfeAdapter {
  const { mfeId, uiExpose = "App", buildProps } = config;

  return (entry: MfeManifestEntry) => ({
    async renderServer(ctx) {
      return renderMfeUi({
        mfeId,
        entry,
        uiExpose,
        ctx,
        buildProps,
      });
    },
  });
}
