const CATALOG = [
  { id: 'p1', name: 'Lumispa Device', category: 'devices', price: 299, rating: 4.8 },
  { id: 'p2', name: 'ageLOC Serum', category: 'skincare', price: 89, rating: 4.6 },
  { id: 'p3', name: 'Tru Face Line Corrector', category: 'skincare', price: 64, rating: 4.4 },
  { id: 'p4', name: 'Pharmanex Omega', category: 'wellness', price: 42, rating: 4.7 },
  { id: 'p5', name: 'Boost Powder', category: 'wellness', price: 58, rating: 4.5 },
  { id: 'p6', name: 'Home Spa Kit', category: 'devices', price: 149, rating: 4.3 },
]

function slugFromUrl(url) {
  const path = String(url || '').split('?')[0]
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || 'catalog'
}

export function buildInitialCatalogState(options) {
  const { url, customerTier = 'standard', locale = {} } = options || {}
  const pageSlug = slugFromUrl(url)
  const categoryFromSlug =
    CATALOG.find((p) => p.category === pageSlug)?.category || 'all'

  return {
    session: {
      customerTier,
      market: locale.market || 'us',
      language: locale.language || 'en',
      loadedAt: new Date().toISOString(),
    },
    filters: {
      category: categoryFromSlug,
      sort: 'rating-desc',
      search: '',
    },
    wishlist: ['p2'],
    compareList: [],
    expandedProductId: null,
    products: CATALOG,
    metrics: {
      renderPass: 0,
      interactionCount: 0,
    },
    pageSlug,
  }
}

export async function fetchPageData(context) {
  const params = context?.params || {}
  const url = params.url || '/us/en/catalog'
  const customerTier = params.customerTier || 'standard'

  await new Promise((r) => setTimeout(r, 12))

  const initialState = buildInitialCatalogState({
    url,
    customerTier,
    locale: params.locale,
  })

  const seo = {
    title: `Nu Skin Catalog — ${initialState.pageSlug} (${customerTier})`,
    description: `Browse ${initialState.products.length} products with filters, wishlist, and compare.`,
    canonicalPath: url.split('?')[0],
    ogImage: 'https://www.nuskin.com/content/dam/global/library/open-graph/default.jpg',
    robots: 'index, follow',
  }

  return {
    initialState,
    seo,
    url,
    isPageFound: true,
  }
}
