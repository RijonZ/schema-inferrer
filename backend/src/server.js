import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { parseInput } from './parse.js'
import { inferSchema } from './inference.js'
import { generateDdl } from './ddl.js'
import { suggestImprovements, isLlmEnabled } from './llm.js'

const app = express()
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } })

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, llmEnabled: isLlmEnabled() })
})

app.post('/api/infer', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const tableName = (req.body.tableName || req.file.originalname.split('.')[0] || 'inferred_table')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase()

    const text = req.file.buffer.toString('utf-8')
    const { headers, rows } = parseInput(req.file.originalname, text)

    if (headers.length === 0) {
      return res.status(400).json({ error: 'Could not detect any columns in the uploaded file' })
    }

    const schema = inferSchema(headers, rows)
    const ddl = generateDdl(tableName, schema)

    res.json({ tableName, schema, ddl, llmEnabled: isLlmEnabled() })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to process file' })
  }
})

app.post('/api/analyze', async (req, res) => {
  try {
    const { tableName, schema } = req.body
    if (!schema) return res.status(400).json({ error: 'Missing schema in request body' })
    const result = await suggestImprovements(tableName || 'inferred_table', schema)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'LLM analysis failed' })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Schema Inferrer backend running on http://localhost:${PORT}`)
})
