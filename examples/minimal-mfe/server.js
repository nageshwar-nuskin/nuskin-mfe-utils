const express = require('express')
const path = require('path')

const PORT = Number(process.env.EXAMPLE_MFE_PORT) || 5510
const dist = path.join(__dirname, 'dist')

const app = express()
app.use('/static', express.static(dist))
app.get('/health', (_req, res) => res.json({ status: 'ok', mfe: 'example_mfe' }))

app.listen(PORT, () => {
  console.log(`example_mfe static server http://localhost:${PORT}`)
  console.log(`  client remoteEntry: http://localhost:${PORT}/static/remoteEntry.js`)
  console.log(`  server remoteEntry: http://localhost:${PORT}/static/server/remoteEntry.js`)
})
