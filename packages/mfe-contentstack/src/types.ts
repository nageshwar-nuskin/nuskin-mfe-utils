export interface ContentstackLivePreviewOptions {
  enable?: boolean;
  cleanCslpOnProduction?: boolean;
}

export interface GetContentOptions {
  uid?: string;
  url?: string;
  contentType?: string;
  language?: string;
  fallbackLocale?: string;
  referenceFields?: string[];
}

export interface CreateContentstackClientOptions {
  apiKey?: string | null;
  deliveryToken?: string | null;
  environment?: string | null;
  previewToken?: string | null;
  previewHost?: string;
  appHost?: string;
  defaultBranch?: string;
  getBranch: () => string;
  isEditing: () => boolean;
  shouldFetch?: () => boolean;
  getUrlBranch?: (url?: string) => string | null;
  requireConfiguration?: boolean;
  livePreview?: ContentstackLivePreviewOptions;
  onError?: (error: unknown) => void;
}

export interface ContentstackClient {
  stack: Record<string, unknown>;
  hasConfiguration(): boolean;
  getCurrentBranch(url?: string): string;
  setRequestUrl(url?: string): void;
  getContent(options?: GetContentOptions): Promise<unknown>;
  initLivePreview(): void;
  setBranch(branch: string): string;
  onEntryChange: (...args: unknown[]) => unknown;
}
