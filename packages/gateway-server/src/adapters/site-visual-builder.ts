import type { MfeAdapter, MfeManifestEntry } from "@nuskin/gateway-contracts";
import { renderMfeUi } from "./render-ui.js";

/** Gateway path: render VB Home UI directly. MFE standalone SSR/Express unchanged. */
export function createSiteVisualBuilderAdapter(
  entry: MfeManifestEntry,
): MfeAdapter {
  return {
    async renderServer(ctx) {
      return renderMfeUi({
        mfeId: "site_visual_builder",
        entry,
        uiExpose: "Home",
        ctx,
        buildProps: ({ serverData }) => ({
          params: {
            vbResponse: serverData?.vbResponse ?? serverData,
            ...serverData,
          },
        }),
      });
    },
  };
}
