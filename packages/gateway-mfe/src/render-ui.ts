import { createElement, Fragment, type ComponentType, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import type {
  MfeManifestEntry,
  MfeRenderResult,
  RenderContext,
} from "@nuskin/gateway-contracts";
import { loadRemoteModule } from "./federation-remote.js";

export type MfeUiModuleShape = {
  default?: ComponentType<Record<string, unknown>>;
  getServerSideProps?: (context: {
    params?: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  getSEOTags?: (context: {
    params?: Record<string, unknown>;
    serverProps?: Record<string, unknown>;
    isServerDataAvailable?: boolean;
  }) => ReactNode | ReactNode[];
};

function resolveComponent(
  mod: MfeUiModuleShape | ComponentType<Record<string, unknown>>,
): ComponentType<Record<string, unknown>> {
  if (typeof mod === "function") {
    return mod as ComponentType<Record<string, unknown>>;
  }
  if (mod?.default && typeof mod.default === "function") {
    return mod.default;
  }
  throw new Error("Remote module did not export a React component");
}

export type BuildUiProps = (options: {
  ctx: RenderContext;
  serverData: Record<string, unknown>;
}) => Record<string, unknown>;

function renderSeoHead(
  tags: ReactNode | ReactNode[] | null | undefined,
): string {
  if (tags == null) {
    return "";
  }
  if (typeof tags === "string") {
    return tags;
  }
  const list = Array.isArray(tags) ? tags : [tags];
  const nodes = list.filter((node) => node != null && node !== false);
  if (nodes.length === 0) {
    return "";
  }
  return renderToString(createElement(Fragment, null, ...nodes));
}

/** SSR from an already-resolved module (in-process / monorepo). */
export async function renderMfeUiFromModule(options: {
  mfeId: string;
  module: MfeUiModuleShape | ComponentType<Record<string, unknown>>;
  ctx: RenderContext;
  buildProps: BuildUiProps;
}): Promise<MfeRenderResult> {
  const { ctx, buildProps } = options;
  const mod =
    typeof options.module === "function"
      ? ({ default: options.module } as MfeUiModuleShape)
      : options.module;
  const Component = resolveComponent(mod);

  let serverData: Record<string, unknown> = {};
  if (typeof mod.getServerSideProps === "function") {
    serverData =
      (await mod.getServerSideProps({
        params: { url: ctx.url, ...(ctx.params || {}) },
      })) || {};
  }

  const props = buildProps({ ctx, serverData });
  const html = renderToString(createElement(Component, props));

  let head = "";
  if (typeof mod.getSEOTags === "function") {
    const seoTags = mod.getSEOTags({
      params: { url: ctx.url, ...(ctx.params || {}) },
      serverProps: props,
      isServerDataAvailable: true,
    });
    head = renderSeoHead(seoTags);
  }

  return {
    html,
    head: head || undefined,
    state: props,
  };
}

/** SSR via federation server remoteEntry. */
export async function renderMfeUi(options: {
  mfeId: string;
  entry: MfeManifestEntry;
  uiExpose: string;
  ctx: RenderContext;
  buildProps: BuildUiProps;
  federationHostName?: string;
}): Promise<MfeRenderResult> {
  const { mfeId, entry, uiExpose, ctx, buildProps, federationHostName } =
    options;

  const loaded = await loadRemoteModule<
    MfeUiModuleShape | ComponentType<Record<string, unknown>>
  >(mfeId, uiExpose, entry, federationHostName);

  return renderMfeUiFromModule({
    mfeId,
    module: loaded,
    ctx,
    buildProps,
  });
}
