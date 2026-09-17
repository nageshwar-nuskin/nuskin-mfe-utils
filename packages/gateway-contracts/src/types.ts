export interface HostContext {
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  env?: string;
  [key: string]: unknown;
}

export interface RenderContext {
  requestId: string;
  url: string;
  locale: {
    market: string;
    language: string;
  };
  params: Record<string, unknown>;
  host: HostContext;
  slotId: string;
}

export interface MfeRenderResult {
  html: string;
  state?: unknown;
  head?: string;
  assets?: {
    scripts: string[];
    styles: string[];
  };
  diagnostics?: {
    warnings?: string[];
  };
}

export interface MfeAdapter {
  renderServer?: (ctx: RenderContext) => Promise<MfeRenderResult>;
  hydrateClient?: (
    el: HTMLElement,
    ctx: RenderContext,
    state?: unknown,
  ) => void | Promise<void>;
  mountClient?: (el: HTMLElement, ctx: RenderContext) => void | Promise<void>;
  getServerSideProps?: (ctx: RenderContext) => Promise<unknown>;
}

export type SlotRenderMode = "ssr" | "csr" | "fallback";

export interface SlotRequest {
  slotId: string;
  mfeId: string;
  params?: Record<string, unknown>;
  /** Overrides manifest default */
  ssr?: boolean;
  loaderIndex?: number;
}

/** ContentStack-resolved remote URLs passed from storefront (overrides static manifest). */
export interface MfeRemoteConfigOverride {
  clientEntry?: string;
  serverEntry?: string;
  ssr?: boolean;
}

export interface ComposeRequest {
  requestId?: string;
  url: string;
  locale: {
    market: string;
    language: string;
  };
  layout?: string;
  slots: SlotRequest[];
  hostContext?: HostContext;
  /** Per-MFE remote entry URLs from ContentStack (keyed by mfeId / app_name). */
  mfeRemoteConfig?: Record<string, MfeRemoteConfigOverride>;
}

export interface RenderedSlot {
  slotId: string;
  mfeId: string;
  mode: SlotRenderMode;
  loaderId: string;
  html: string;
  head?: string;
  assets?: MfeRenderResult["assets"];
  error?: {
    message: string;
    phase: string;
  };
}

export interface GatewayBootstrap {
  version: string;
  requestId: string;
  url: string;
  shared: {
    locale: ComposeRequest["locale"];
  };
  slots: Array<{
    slotId: string;
    mfeId: string;
    mode: SlotRenderMode;
    loaderId: string;
    state?: unknown;
    client: {
      remoteEntry: string;
      module: string;
    };
  }>;
}

export interface ComposeResponse {
  requestId: string;
  slots: RenderedSlot[];
  head: string;
  bootstrap: GatewayBootstrap;
  bootstrapScript: string;
  diagnostics: {
    errors: Array<{
      mfeId: string;
      slotId: string;
      phase: string;
      message: string;
    }>;
  };
}

export interface MfeManifestEntry {
  id: string;
  displayName?: string;
  ssr?: boolean;
  slot?: string;
  critical?: boolean;
  timeoutMs?: number;
  federation?: {
    name: string;
    exposes?: Record<string, string>;
    client?: { remoteEntry: string };
    server?: { remoteEntry: string; entryGlobalName?: string };
  };
  loadable?: {
    clientStats?: string;
    serverStats?: string;
  };
  fallback?: {
    html?: string;
    csrOnSsrFailure?: boolean;
  };
  featureFlags?: Record<
    string,
    { flag?: string; default?: boolean }
  >;
}

export interface GatewayManifest {
  version: string;
  defaults?: {
    timeoutMs?: number;
    ssr?: boolean;
    assetBase?: string;
  };
  mfes: Record<string, MfeManifestEntry>;
  composition?: {
    layouts?: Record<string, { slots: string[] }>;
  };
}
