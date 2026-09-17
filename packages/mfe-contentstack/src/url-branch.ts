export function readSearchFromUrl(url?: string): string {
  if (typeof url === 'string') {
    return url.includes('?') ? url.split('?').slice(1).join('?') : '';
  }

  if (typeof window !== 'undefined') {
    return (window.location?.search ?? '').replace(/^\?/, '');
  }

  return '';
}

export function createUrlBranchReader(
  paramNames: string[] = ['cs_branch'],
): (url?: string) => string | null {
  return (url?: string) => {
    const search = readSearchFromUrl(url);
    if (!search) {
      return null;
    }

    const params = new URLSearchParams(search);
    for (const name of paramNames) {
      const value = params.get(name);
      if (value) {
        return value;
      }
    }

    return null;
  };
}
