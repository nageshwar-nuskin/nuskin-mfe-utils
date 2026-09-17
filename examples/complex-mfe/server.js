const express = require('express')
const path = require('path')

const PORT = Number(process.env.COMPLEX_MFE_PORT) || 5512
const dist = path.join(__dirname, 'dist')

const app = express()
app.use('/static', express.static(dist))
app.get('/health', (_req, res) => res.json({ status: 'ok', mfe: 'complex_demo_mfe' }))

app.listen(PORT, () => {
  console.log(`complex_demo_mfe http://localhost:${PORT}`)
  console.log(`  client: http://localhost:${PORT}/static/remoteEntry.js`)
  console.log(`  server: http://localhost:${PORT}/static/server/remoteEntry.js`)
})
