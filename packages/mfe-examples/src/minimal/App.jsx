import React from 'react'

/**
 * Optional — gateway calls this before renderToString when present.
 */
export async function getServerSideProps({ params }) {
  const url = params?.url || '/'
  return {
    greeting: `Hello from example_mfe (SSR) — ${url}`,
    renderedAt: new Date().toISOString(),
  }
}

export default function App({ greeting = 'Hello from example_mfe (CSR)' }) {
  return (
    <aside
      data-example-mfe
      style={{
        padding: '12px 16px',
        margin: '8px 0',
        border: '2px dashed #4a90d9',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif',
        background: '#f0f7ff',
      }}
    >
      <strong>Example MFE</strong>
      <p style={{ margin: '8px 0 0' }}>{greeting}</p>
    </aside>
  )
}
