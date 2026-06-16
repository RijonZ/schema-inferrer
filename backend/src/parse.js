// Parses raw uploaded text (CSV or JSON) into a uniform array of row objects.

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const splitLine = (line) => {
    const cells = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"'
          i++
        } else if (ch === '"') {
          inQuotes = false
        } else {
          cur += ch
        }
      } else if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        cells.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur)
    return cells.map((c) => c.trim())
  }

  const headers = splitLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line)
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = cells[i] !== undefined ? cells[i] : ''
    })
    return obj
  })
  return { headers, rows }
}

function parseJson(text) {
  const data = JSON.parse(text)
  const rows = Array.isArray(data) ? data : data.rows || data.data || [data]
  const headerSet = new Set()
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => headerSet.add(k)))
  return { headers: [...headerSet], rows }
}

export function parseInput(filename, text) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return parseJson(text)
  if (lower.endsWith('.csv')) return parseCsv(text)
  // fallback: sniff content
  const trimmed = text.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) return parseJson(text)
  return parseCsv(text)
}
