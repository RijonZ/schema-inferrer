import OpenAI from 'openai'

let client = null
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

export function isLlmEnabled() {
  return Boolean(process.env.OPENAI_API_KEY)
}

// Sends only column-level statistics (no raw row data) to the LLM for privacy.
export async function suggestImprovements(tableName, schema) {
  const openai = getClient()
  if (!openai) throw new Error('OPENAI_API_KEY is not configured on the server')

  const summary = schema.columns.map((c) => ({
    name: c.name,
    type: c.inferredType,
    nullable: c.nullable,
    distinctCount: c.distinctCount,
    totalCount: c.totalCount,
    issues: c.issues,
    sampleValues: c.sampleValues
  }))

  const prompt = `You are a database design assistant. Given this inferred table schema (table "${tableName}", ${schema.rowCount} rows), respond ONLY with strict JSON of this shape:
{"anomalies": [{"column": string, "message": string}], "normalization": [string], "namingSuggestions": [{"column": string, "suggested": string, "reason": string}]}

Rules:
- anomalies: real data-quality red flags (mixed types, high nullability, suspicious constant columns, possible duplicate-meaning columns).
- normalization: 1-3 short suggestions about splitting tables / 1NF-3NF improvements, only if justified by the columns shown.
- namingSuggestions: only for columns with unclear/inconsistent naming.
- If nothing notable, return empty arrays. No prose outside the JSON.

Schema:
${JSON.stringify(summary, null, 2)}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2
  })

  return JSON.parse(completion.choices[0].message.content)
}
