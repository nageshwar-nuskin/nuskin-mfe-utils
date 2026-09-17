import type { MfeManifestEntry, MfeRenderResult, RenderContext } from "@nuskin/gateway-contracts";
import {
  renderMfeUiFromModule,
  type BuildUiProps,
  type MfeUiModuleShape,
} from "./render-ui.js";

/**
 * Adapter for @nuskin/mfe-examples — SSR without fetching a server remoteEntry.
 */
export function createInlineUiAdapter(options: {
  mfeId: string;
  module: MfeUiModuleShape;
  buildProps: BuildUiProps;
}): (_entry: MfeManifestEntry) => {
  renderServer: (ctx: RenderContext) => Promise<MfeRenderResult>;
} {
  const { mfeId, module, buildProps } = options;

  return () => ({
    async renderServer(ctx) {
      return renderMfeUiFromModule({
        mfeId,
        module,
        ctx,
        buildProps,
      });
    },
  });
}
