export default function InsightsPanel({ insights, loading, error, onAnalyze, llmEnabled }) {
  if (!llmEnabled) {
    return (
      <div className="rounded-xl border border-edge bg-panel p-5 text-sm text-slate-400">
        Set <code className="text-accent2">OPENAI_API_KEY</code> in backend/.env to enable
        AI analysis (anomalies &amp; normalization).
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-edge bg-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-200">AI Analysis</h3>
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {insights && (
        <div className="space-y-4 text-sm">
          {insights.anomalies?.length > 0 && (
            <div>
              <h4 className="text-amber-300 font-medium mb-1">Anomalies</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {insights.anomalies.map((a, i) => (
                  <li key={i}>
                    <span className="text-slate-100 font-medium">{a.column}:</span> {a.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.normalization?.length > 0 && (
            <div>
              <h4 className="text-accent2 font-medium mb-1">Normalization suggestions</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {insights.normalization.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.namingSuggestions?.length > 0 && (
            <div>
              <h4 className="text-fuchsia-300 font-medium mb-1">Naming</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {insights.namingSuggestions.map((n, i) => (
                  <li key={i}>
                    <span className="font-medium text-slate-100">{n.column}</span> → {n.suggested} ({n.reason})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!insights.anomalies?.length && !insights.normalization?.length && !insights.namingSuggestions?.length && (
            <p className="text-slate-400">Nothing suspicious found.</p>
          )}
        </div>
      )}
    </div>
  )
}
