import express from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTWORKS_PATH = resolve(__dirname, 'src/data/artworks.json')

const app = express()
app.use(express.json({ limit: '5mb' }))

// GET — return current artworks
app.get('/api/artworks', (_req, res) => {
  try {
    const data = readFileSync(ARTWORKS_PATH, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT — save entire artworks array
app.put('/api/artworks', (req, res) => {
  try {
    const artworks = req.body
    if (!Array.isArray(artworks)) {
      return res.status(400).json({ error: 'Body must be an array' })
    }
    writeFileSync(ARTWORKS_PATH, JSON.stringify(artworks, null, 2) + '\n', 'utf-8')
    res.json({ ok: true, count: artworks.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🎨 Admin API server running at http://localhost:${PORT}\n`)
})
