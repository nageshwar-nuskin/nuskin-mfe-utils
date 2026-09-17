import type { MfeAdapter, MfeManifestEntry } from "@nuskin/gateway-contracts";
import { renderMfeUi } from "./render-ui.js";

/** Gateway path: render header UI directly. MFE standalone SSR/Express unchanged. */
export function createHeaderMfeAdapter(entry: MfeManifestEntry): MfeAdapter {
  return {
    async renderServer(ctx) {
      return renderMfeUi({
        mfeId: "header_mfe",
        entry,
        uiExpose: "App",
        ctx,
        buildProps: ({ ctx: renderCtx, serverData }) => ({
          market: renderCtx.locale?.market,
          language: renderCtx.locale?.language,
          params: serverData,
        }),
      });
    },
  };
}
