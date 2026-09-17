import type {
  ComposeRequest,
  ComposeResponse,
  SlotRequest,
} from "@nuskin/gateway-contracts";

export interface StorefrontMfeAppConfig {
  remoteConfig?: {
    appName?: string;
    component?: string;
  };
  isToEnableSSR?: boolean;
  params?: Record<string, unknown>;
  loaderIndex?: number;
}

export interface StorefrontMfeAppResult {
  appName: string | null | undefined;
  mfeComponent: null;
  mfeServerData: Record<string, unknown> | null;
  getSEOTags: null;
  _diagnostics?: unknown;
}

export function buildComposeRequest(options: {
  appsToRender: StorefrontMfeAppConfig[];
  originalUrl: string;
  locale: { market: string; language: string };
  hostContext?: Record<string, unknown>;
  mfeRemoteConfig?: ComposeRequest["mfeRemoteConfig"];
}): ComposeRequest {
  const slots: SlotRequest[] = options.appsToRender.map((app, index) => ({
    slotId:
      (app.remoteConfig?.appName || `slot-${index}`).replace(/_mfe$/, "") ||
      `slot-${index}`,
    mfeId: app.remoteConfig?.appName || "",
    ssr: app.isToEnableSSR,
    params: app.params,
    loaderIndex: app.loaderIndex ?? index,
  }));

  return {
    url: options.originalUrl,
    locale: options.locale,
    slots,
    hostContext: options.hostContext,
    mfeRemoteConfig: options.mfeRemoteConfig,
  };
}

export function mapComposeToStorefrontApps(options: {
  composeResult: ComposeResponse;
  appsToRender: StorefrontMfeAppConfig[];
  originalUrl: string;
  clientRemoteConfigs?: Record<
    string,
    { name: string; entry: string; component?: string }
  >;
}): StorefrontMfeAppResult[] {
  const {
    composeResult,
    appsToRender,
    originalUrl,
    clientRemoteConfigs = {},
  } = options;

  return appsToRender.map((app, index) => {
    const mfeId = app.remoteConfig?.appName || "";
    const rendered = composeResult.slots.find((s) => s.mfeId === mfeId);

    const slotState =
      composeResult.bootstrap.slots.find((s) => s.mfeId === mfeId)?.state ||
      undefined;

    const clientConfig = clientRemoteConfigs[mfeId];
    const stateRecord =
      slotState && typeof slotState === "object"
        ? (slotState as Record<string, unknown>)
        : {};

    const mfeServerData: Record<string, unknown> = {
      url: originalUrl,
      isPageFound: true,
      ssrHtml: rendered?.html || "",
      _useGatewayRuntime: true,
      _gatewayBootstrap: composeResult.bootstrap,
      _gatewayBootstrapScript: composeResult.bootstrapScript,
      _gatewaySlot: rendered,
      ...(stateRecord.vbParams
        ? stateRecord
        : { gatewayState: slotState }),
    };

    if (clientConfig?.name && clientConfig?.entry) {
      mfeServerData._clientRemoteConfig = {
        name: clientConfig.name,
        entry: clientConfig.entry,
        component: app.remoteConfig?.component || "MfeAdapter",
      };
    }

    const slotError = composeResult.diagnostics.errors.find(
      (e) => e.mfeId === mfeId,
    );

    return {
      appName: mfeId,
      mfeComponent: null,
      mfeServerData,
      getSEOTags: null,
      _diagnostics: slotError
        ? {
            mfeServerDiag: { errors: [slotError] },
            serverRemoteLoaderDiag: null,
            gatewayDiag: composeResult.diagnostics,
          }
        : { gatewayDiag: composeResult.diagnostics },
    };
  });
}
