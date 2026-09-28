import express from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COLLECTIONS = {
  artworks: resolve(__dirname, 'src/data/artworks.json'),
  sketches: resolve(__dirname, 'src/data/sketches.json'),
  photos:   resolve(__dirname, 'src/data/photos.json'),
}

const app = express()
app.use(express.json({ limit: '5mb' }))

// GET — return a single collection or all merged
app.get(['/api/works', '/api/works/:collection'], (req, res) => {
  try {
    const { collection } = req.params
    if (collection && COLLECTIONS[collection]) {
      const data = readFileSync(COLLECTIONS[collection], 'utf-8')
      return res.json(JSON.parse(data))
    }
    // No collection specified → return all merged
    const all = Object.values(COLLECTIONS).flatMap(path => {
      return JSON.parse(readFileSync(path, 'utf-8'))
    })
    res.json(all)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Legacy endpoint for backwards compatibility
app.get('/api/artworks', (_req, res) => {
  try {
    const data = readFileSync(COLLECTIONS.artworks, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT — save a collection
app.put('/api/works/:collection', (req, res) => {
  try {
    const { collection } = req.params
    const filePath = COLLECTIONS[collection]
    if (!filePath) {
      return res.status(404).json({ error: `Unknown collection: ${collection}` })
    }
    const items = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body must be an array' })
    }
    writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n', 'utf-8')
    res.json({ ok: true, count: items.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Legacy PUT
app.put('/api/artworks', (req, res) => {
  try {
    const artworks = req.body
    if (!Array.isArray(artworks)) {
      return res.status(400).json({ error: 'Body must be an array' })
    }
    writeFileSync(COLLECTIONS.artworks, JSON.stringify(artworks, null, 2) + '\n', 'utf-8')
    res.json({ ok: true, count: artworks.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🎨 Admin API server running at http://localhost:${PORT}\n`)
})
