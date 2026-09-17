import React from 'react'

function resolveCanonical(seo, params) {
  const base = 'https://www.nuskin.com'
  const path = seo?.canonicalPath || params?.url || ''
  if (!path) return base
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Same contract as production MFEs — used by gateway SSR (renderToString) and
 * storefront RemoteLoader + react-helmet on the client.
 */
export function getSEOTags(context) {
  const serverProps = context?.serverProps || context?.params || {}
  const seo = serverProps.seo || {}
  const params = context?.params || {}
  const canonical = resolveCanonical(seo, params)

  return [
    <title key="complex-demo-title">{seo.title || 'Nu Skin Catalog'}</title>,
    <meta
      key="complex-demo-desc"
      name="description"
      content={seo.description || 'Product catalog'}
    />,
    <meta key="complex-demo-robots" name="robots" content={seo.robots || 'index, follow'} />,
    <link key="complex-demo-canonical" rel="canonical" href={canonical} />,
    <meta key="complex-demo-og-title" property="og:title" content={seo.title || 'Nu Skin Catalog'} />,
    <meta
      key="complex-demo-og-desc"
      property="og:description"
      content={seo.description || ''}
    />,
    <meta
      key="complex-demo-og-image"
      property="og:image"
      content={seo.ogImage || ''}
    />,
    <script
      key="complex-demo-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: seo.title,
          numberOfItems: serverProps?.initialState?.products?.length || 0,
        }),
      }}
    />,
  ]
}
