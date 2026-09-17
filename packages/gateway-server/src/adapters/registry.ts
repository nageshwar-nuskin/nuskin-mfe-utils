import type { MfeAdapter, MfeManifestEntry } from "@nuskin/gateway-contracts";
import {
  complexDemoMfeApp,
  complexDemoMfeGetServerSideProps,
  complexDemoMfeGetSEOTags,
  exampleMfeApp,
  exampleMfeGetServerSideProps,
} from "@nuskin/mfe-examples";
import { createHeaderMfeAdapter } from "./header-mfe.js";
import { createInlineUiAdapter } from "./render-inline.js";
import type { MfeUiModuleShape } from "./render-ui.js";
import { createSiteVisualBuilderAdapter } from "./site-visual-builder.js";

const exampleMfeModule = {
  default: exampleMfeApp,
  getServerSideProps: exampleMfeGetServerSideProps,
} as MfeUiModuleShape;

const complexDemoMfeModule = {
  default: complexDemoMfeApp,
  getServerSideProps: complexDemoMfeGetServerSideProps,
  getSEOTags: complexDemoMfeGetSEOTags,
} as MfeUiModuleShape;

const GATEWAY_ADAPTERS: Record<
  string,
  (entry: MfeManifestEntry) => MfeAdapter
> = {
  header_mfe: createHeaderMfeAdapter,
  site_visual_builder: createSiteVisualBuilderAdapter,

  /** @nuskin/mfe-examples — inline SSR, client bundle on gateway :3100 */
  example_mfe: createInlineUiAdapter({
    mfeId: "example_mfe",
    module: exampleMfeModule,
    buildProps: ({ ctx, serverData }) => ({
      ...serverData,
      greeting:
        (serverData?.greeting as string) ||
        `Hello from ${ctx.locale?.market}/${ctx.locale?.language}`,
    }),
  }),

  complex_demo_mfe: createInlineUiAdapter({
    mfeId: "complex_demo_mfe",
    module: complexDemoMfeModule,
    buildProps: ({ ctx, serverData }) => ({
      ...serverData,
      isServerDataAvailable: true,
      params: {
        url: ctx.url,
        locale: ctx.locale,
        ...(ctx.params || {}),
      },
    }),
  }),

  // Template for new production MFEs (federation remote):
  // cart_mfe: createGenericUiAdapter({ ... }),
};

/**
 * Gateway-owned adapters — register new MFEs here (see README).
 */
export function getGatewayAdapter(
  mfeId: string,
  entry: MfeManifestEntry,
): MfeAdapter | null {
  const factory = GATEWAY_ADAPTERS[mfeId];
  if (!factory) {
    return null;
  }
  return factory(entry);
}

export function listGatewayAdapters(): string[] {
  return Object.keys(GATEWAY_ADAPTERS);
}
