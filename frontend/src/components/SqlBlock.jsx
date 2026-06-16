import { useState } from 'react'

export default function SqlBlock({ ddl }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(ddl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative rounded-xl border border-edge bg-panel">
      <button
        onClick={copy}
        className="absolute right-3 top-3 rounded-md bg-edge px-3 py-1 text-xs font-medium text-slate-200 hover:bg-accent/30 transition-colors"
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 text-sm text-emerald-300/90">
        <code>{ddl}</code>
      </pre>
    </div>
  )
}
