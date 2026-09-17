import { readSearchFromUrl } from './url-branch';

const DEFAULT_QUERY_PARAMS = [
  'visual-builder',
  'contentstack',
  'live_preview',
];

export interface CreateIsEditingModeOptions {
  mfe: string;
  detectIframe?: boolean;
  pathnameIncludes?: string;
  queryParams?: string[];
}

export function createIsEditingMode({
  mfe,
  detectIframe = true,
  pathnameIncludes,
  queryParams = DEFAULT_QUERY_PARAMS,
}: CreateIsEditingModeOptions): () => boolean {
  return () => {
    if (typeof window === 'undefined') {
      return false;
    }

    const params = new URLSearchParams(readSearchFromUrl());
    const mfeParam = params.get('mfe');
    if (mfeParam) {
      return mfeParam === mfe;
    }

    if (detectIframe && window.self !== window.top) {
      return true;
    }

    if (
      pathnameIncludes &&
      !window.location?.pathname?.includes(pathnameIncludes)
    ) {
      return false;
    }

    return queryParams.some((name) => params.has(name));
  };
}
