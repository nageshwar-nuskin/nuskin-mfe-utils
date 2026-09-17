import React, { createContext, useContext, useMemo, useReducer } from 'react'

const CatalogContext = createContext(null)

function catalogReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        metrics: {
          ...state.metrics,
          interactionCount: state.metrics.interactionCount + 1,
        },
      }
    case 'TOGGLE_WISHLIST': {
      const id = action.payload
      const has = state.wishlist.includes(id)
      const wishlist = has
        ? state.wishlist.filter((x) => x !== id)
        : [...state.wishlist, id]
      return {
        ...state,
        wishlist,
        metrics: {
          ...state.metrics,
          interactionCount: state.metrics.interactionCount + 1,
        },
      }
    }
    case 'TOGGLE_COMPARE': {
      const id = action.payload
      const has = state.compareList.includes(id)
      let compareList = has
        ? state.compareList.filter((x) => x !== id)
        : [...state.compareList, id]
      if (compareList.length > 3) {
        compareList = compareList.slice(-3)
      }
      return {
        ...state,
        compareList,
        metrics: {
          ...state.metrics,
          interactionCount: state.metrics.interactionCount + 1,
        },
      }
    }
    case 'SET_EXPANDED':
      return {
        ...state,
        expandedProductId: action.payload,
        metrics: {
          ...state.metrics,
          interactionCount: state.metrics.interactionCount + 1,
        },
      }
    case 'BUMP_RENDER_PASS':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          renderPass: state.metrics.renderPass + 1,
        },
      }
    default:
      return state
  }
}

export function CatalogProvider({ initialState, children }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState)

  const filteredProducts = useMemo(() => {
    let list = [...state.products]
    const { category, sort, search } = state.filters

    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price)
    } else {
      list.sort((a, b) => b.rating - a.rating)
    }
    return list
  }, [state.products, state.filters])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      filteredProducts,
      wishlistCount: state.wishlist.length,
      compareCount: state.compareList.length,
    }),
    [state, filteredProducts],
  )

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }
  return ctx
}
