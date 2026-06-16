import { useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import SchemaTable from './components/SchemaTable.jsx'
import SqlBlock from './components/SqlBlock.jsx'
import InsightsPanel from './components/InsightsPanel.jsx'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [insights, setInsights] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const handleFile = async (file) => {
    setLoading(true)
    setError('')
    setResult(null)
    setInsights(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/infer', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!result) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: result.tableName, schema: result.schema })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setInsights(data)
    } catch (err) {
      setAnalyzeError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen text-slate-100">
      <header className="border-b border-edge px-6 py-5">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <span className="text-2xl">🧬</span>
          <div>
            <h1 className="text-xl font-bold">Schema Inferrer</h1>
            <p className="text-sm text-slate-400">Messy CSV/JSON → clean schema + CREATE TABLE SQL</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <UploadZone onFileSelected={handleFile} loading={loading} />

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <>
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-lg font-semibold">Detected Schema</h2>
                <span className="text-sm text-slate-400">
                  {result.schema.rowCount} rows · {result.schema.columns.length} columns
                </span>
              </div>
              <SchemaTable schema={result.schema} primaryKeyCandidate={result.schema.primaryKeyCandidate} />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">CREATE TABLE</h2>
              <SqlBlock ddl={result.ddl} />
            </section>

            <section>
              <InsightsPanel
                insights={insights}
                loading={analyzing}
                error={analyzeError}
                onAnalyze={handleAnalyze}
                llmEnabled={result.llmEnabled}
              />
            </section>
          </>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-slate-500">
        Built with React + Node.js · Schema Inferrer
      </footer>
    </div>
  )
}
