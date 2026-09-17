import React from 'react'
import CatalogDashboard from './components/CatalogDashboard.jsx'
import { CatalogProvider } from './state/CatalogContext.jsx'
import { buildInitialCatalogState, fetchPageData } from './data/fetchPageData.js'
import { getSEOTags } from './seo/getSEOTags.jsx'

export { getSEOTags }

export async function getServerSideProps(context) {
  return fetchPageData(context)
}

export default function App({
  params: paramBag = {},
  isServerDataAvailable = false,
  initialState: initialFromServer,
  url: urlFromServer,
} = {}) {
  const initialState =
    initialFromServer ||
    paramBag.initialState ||
    buildInitialCatalogState({
      url: urlFromServer || paramBag.url,
      customerTier: paramBag.customerTier,
      locale: paramBag.locale,
    })

  return (
    <CatalogProvider initialState={resolvedInitial}>
      <CatalogDashboard isServerDataAvailable={isServerDataAvailable} />
    </CatalogProvider>
  )
}
