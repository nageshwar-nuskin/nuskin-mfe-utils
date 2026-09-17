import type { MfeRenderResult } from "@nuskin/gateway-contracts";

/** Legacy header-mfe / storefront SSR response shape. */
export interface RenderAndExtractContextResult {
  markup: string;
  dataScript: string;
  head?: string;
  state?: unknown;
}

export function mfeRenderResultToLegacy(
  result: MfeRenderResult,
  options?: { stateGlobalName?: string },
): RenderAndExtractContextResult {
  const state = result.state;
  const globalName = options?.stateGlobalName || "__MFE_DATA__";

  let dataScript = "";
  if (state != null && typeof state === "object") {
    const json = JSON.stringify(state).replace(/<\/script>/gi, "<\\/script>");
    dataScript = `<script>window.${globalName}=${json};</script>`;
  }

  return {
    markup: result.html,
    dataScript,
    head: result.head,
    state,
  };
}
