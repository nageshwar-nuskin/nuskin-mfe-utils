export interface GatewayBootstrap {
  version: string;
  requestId: string;
  url: string;
  shared: {
    locale: { market: string; language: string };
  };
  slots: Array<{
    slotId: string;
    mfeId: string;
    mode: "ssr" | "csr" | "fallback";
    loaderId: string;
    state?: unknown;
    client: {
      remoteEntry: string;
      module: string;
    };
  }>;
}

export interface RenderContext {
  requestId: string;
  url: string;
  locale: { market: string; language: string };
  params: Record<string, unknown>;
  host: Record<string, unknown>;
  slotId: string;
}
