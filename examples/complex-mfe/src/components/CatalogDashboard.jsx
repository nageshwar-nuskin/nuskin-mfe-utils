import React, { useEffect } from 'react'
import { useCatalog } from '../state/CatalogContext.jsx'

const styles = {
  root: {
    fontFamily: 'system-ui, sans-serif',
    border: '1px solid #d0d7de',
    borderRadius: 12,
    padding: 16,
    background: '#fafbfc',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#ddf4ff',
    color: '#0969da',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 10,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 10,
  },
}

export default function CatalogDashboard({ isServerDataAvailable }) {
  const { state, dispatch, filteredProducts, wishlistCount, compareCount } =
    useCatalog()

  useEffect(() => {
    dispatch({ type: 'BUMP_RENDER_PASS' })
  }, [dispatch])

  return (
    <section data-complex-demo-mfe style={styles.root}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Complex catalog MFE</h2>
        <p style={{ margin: '6px 0 0', color: '#57606a', fontSize: 13 }}>
          Tier: {state.session.customerTier} · Mode:{' '}
          {isServerDataAvailable ? 'SSR + hydrate' : 'CSR'} · Interactions:{' '}
          {state.metrics.interactionCount}
        </p>
      </header>

      <div style={styles.toolbar} className="catalog-toolbar">
        <span style={styles.badge}>Wishlist {wishlistCount}</span>
        <span style={styles.badge}>Compare {compareCount}</span>
        <select
          value={state.filters.category}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTER', payload: { category: e.target.value } })
          }
        >
          <option value="all">All categories</option>
          <option value="devices">Devices</option>
          <option value="skincare">Skincare</option>
          <option value="wellness">Wellness</option>
        </select>
        <select
          value={state.filters.sort}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTER', payload: { sort: e.target.value } })
          }
        >
          <option value="rating-desc">Top rated</option>
          <option value="price-asc">Price low–high</option>
          <option value="price-desc">Price high–low</option>
        </select>
        <input
          type="search"
          placeholder="Search products"
          value={state.filters.search}
          onChange={(e) =>
            dispatch({ type: 'SET_FILTER', payload: { search: e.target.value } })
          }
        />
      </div>

      <div style={styles.grid}>
        {filteredProducts.map((product) => {
          const inWishlist = state.wishlist.includes(product.id)
          const inCompare = state.compareList.includes(product.id)
          const expanded = state.expandedProductId === product.id
          return (
            <article key={product.id} style={styles.card}>
              <strong>{product.name}</strong>
              <p style={{ margin: '6px 0', fontSize: 13 }}>
                ${product.price} · ★ {product.rating}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })}>
                  {inWishlist ? '♥ Saved' : '♡ Save'}
                </button>
                <button type="button" onClick={() => dispatch({ type: 'TOGGLE_COMPARE', payload: product.id })}>
                  {inCompare ? 'In compare' : 'Compare'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_EXPANDED',
                      payload: expanded ? null : product.id,
                    })
                  }
                >
                  {expanded ? 'Collapse' : 'Details'}
                </button>
              </div>
              {expanded ? (
                <p style={{ fontSize: 12, color: '#57606a', marginTop: 8 }}>
                  Category: {product.category} · ID: {product.id}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
