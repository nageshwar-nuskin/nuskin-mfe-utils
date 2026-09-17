import contentstack from '@contentstack/delivery-sdk';
import ContentstackLivePreview from '@contentstack/live-preview-utils';
import { addEditableTags } from '@contentstack/utils';
import type {
  ContentstackClient,
  CreateContentstackClientOptions,
  GetContentOptions,
} from './types';

const DEFAULT_BRANCH = 'main';
const DEFAULT_PREVIEW_HOST = 'rest-preview.contentstack.com';
const DEFAULT_APP_HOST = 'app.contentstack.com';
const BRIDGED_CONFIG_KEYS = new Set(['live_preview', 'headers', 'environment']);

export function createContentstackClient({
  apiKey,
  deliveryToken,
  environment,
  previewToken,
  previewHost = DEFAULT_PREVIEW_HOST,
  appHost = DEFAULT_APP_HOST,
  defaultBranch = DEFAULT_BRANCH,
  getBranch,
  isEditing,
  shouldFetch = () => true,
  getUrlBranch,
  requireConfiguration = false,
  livePreview = {},
  onError,
}: CreateContentstackClientOptions): ContentstackClient {
  let branch = defaultBranch;
  let stackInstance: ReturnType<typeof contentstack.stack> | null = null;
  let livePreviewInitialized = false;
  let requestUrl: string | undefined;

  function hasConfiguration() {
    return Boolean(apiKey && deliveryToken && environment);
  }

  function applyBranch(nextBranch: string | null | undefined) {
    const next = nextBranch || defaultBranch;
    if (next !== branch) {
      branch = next;
      stackInstance = null;
      livePreviewInitialized = false;
    }
    return next;
  }

  function resolveBranch(url?: string) {
    if (typeof window !== 'undefined' && isEditing()) {
      return applyBranch(getBranch());
    }

    const fromUrl = getUrlBranch?.(url ?? requestUrl) ?? null;
    if (fromUrl) {
      return applyBranch(fromUrl);
    }

    if (typeof window === 'undefined') {
      return branch;
    }

    return applyBranch(defaultBranch);
  }

  function getStack() {
    resolveBranch();

    if (!stackInstance) {
      stackInstance = contentstack.stack({
        apiKey,
        deliveryToken,
        environment,
        branch,
        live_preview: {
          enable: true,
          preview_token: previewToken,
          host: previewHost,
        },
      });
    }

    return stackInstance;
  }

  const stack = new Proxy(
    {},
    {
      get(_, prop) {
        const current = getStack() as Record<string, unknown> & {
          config?: Record<string, unknown>;
        };
        if (BRIDGED_CONFIG_KEYS.has(String(prop))) {
          return current.config?.[String(prop)];
        }
        const value = current[String(prop)];
        return typeof value === 'function' ? value.bind(current) : value;
      },
      set(_, prop, value) {
        const current = getStack() as Record<string, unknown> & {
          config?: Record<string, unknown>;
        };
        if (BRIDGED_CONFIG_KEYS.has(String(prop))) {
          if (!current.config) return false;
          current.config[String(prop)] = value;
          return true;
        }
        current[String(prop)] = value;
        return true;
      },
      has(_, prop) {
        if (BRIDGED_CONFIG_KEYS.has(String(prop))) return true;
        return String(prop) in getStack();
      },
      ownKeys() {
        return [
          ...new Set([
            ...Reflect.ownKeys(getStack()),
            ...Array.from(BRIDGED_CONFIG_KEYS),
          ]),
        ];
      },
      getOwnPropertyDescriptor(_, prop) {
        const current = getStack() as Record<string, unknown> & {
          config?: Record<string, unknown>;
        };
        if (BRIDGED_CONFIG_KEYS.has(String(prop))) {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: current.config?.[String(prop)],
          };
        }
        return Object.getOwnPropertyDescriptor(current, prop);
      },
    },
  );

  async function fetchEntry({
    uid,
    url,
    contentType,
    language,
    referenceFields = [],
  }: GetContentOptions) {
    const contentTypeClient = (getStack() as {
      contentType: (uid: string) => {
        entry: (uid?: string) => {
          locale: (locale?: string) => {
            includeFallback: () => {
              includeReference: (fields: string[]) => {
                fetch: () => Promise<unknown>;
                query: (query: { url: string }) => {
                  find: () => Promise<{ entries?: unknown[] }>;
                };
              };
            };
          };
        };
      };
    }).contentType(contentType as string);

    if (uid) {
      return contentTypeClient
        .entry(uid)
        .locale(language)
        .includeFallback()
        .includeReference(referenceFields)
        .fetch();
    }

    const urlWithSlash = url?.startsWith('/') ? url : `/${url ?? ''}`;
    const result = await contentTypeClient
      .entry()
      .locale(language)
      .includeFallback()
      .includeReference(referenceFields)
      .query({ url: urlWithSlash })
      .find();
    return result?.entries?.[0] ?? null;
  }

  function reportError(error: unknown, language?: string) {
    if (onError) {
      onError(error);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn('Failed to fetch content with language:', language, message);
  }

  async function getContent({
    uid,
    url,
    contentType,
    language,
    fallbackLocale,
    referenceFields = [],
  }: GetContentOptions = {}) {
    if ((requireConfiguration && !hasConfiguration()) || !shouldFetch()) {
      return null;
    }

    if (!uid && !url) {
      return null;
    }

    if (!contentType) {
      return null;
    }

    const tryFetch = async (locale?: string) => {
      const fetched = await fetchEntry({
        uid,
        url,
        contentType,
        language: locale,
        referenceFields,
      });

      if (fetched && isEditing()) {
        addEditableTags(fetched, contentType, true, locale, {
          useLowerCaseLocale: false,
        });
      }

      return fetched ?? null;
    };

    try {
      return await tryFetch(language);
    } catch (error) {
      reportError(error, language);

      if (!fallbackLocale || fallbackLocale === language) {
        return null;
      }

      try {
        return await tryFetch(fallbackLocale);
      } catch (fallbackError) {
        reportError(fallbackError, fallbackLocale);
        return null;
      }
    }
  }

  function initLivePreview() {
    resolveBranch();

    if ((requireConfiguration && !hasConfiguration()) || livePreviewInitialized) {
      return;
    }

    livePreviewInitialized = true;
    ContentstackLivePreview.init({
      ssr: false,
      enable: livePreview.enable ?? true,
      ...(livePreview.cleanCslpOnProduction != null
        ? { cleanCslpOnProduction: livePreview.cleanCslpOnProduction }
        : {}),
      mode: 'builder',
      stackSdk: stack,
      stackDetails: {
        apiKey,
        environment,
        branch,
      },
      clientUrlParams: {
        host: appHost,
      },
      editButton: {
        enable: false,
      },
    });
  }

  return {
    stack,
    hasConfiguration,
    getCurrentBranch(url?: string) {
      return resolveBranch(url);
    },
    setRequestUrl(url?: string) {
      requestUrl = url;
      if (!isEditing()) {
        resolveBranch(url);
      }
    },
    getContent,
    initLivePreview,
    setBranch(nextBranch: string) {
      return applyBranch(nextBranch);
    },
    onEntryChange: ContentstackLivePreview.onEntryChange.bind(
      ContentstackLivePreview,
    ),
  };
}
