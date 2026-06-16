const TYPE_COLORS = {
  integer: 'bg-sky-500/15 text-sky-300',
  float: 'bg-cyan-500/15 text-cyan-300',
  boolean: 'bg-amber-500/15 text-amber-300',
  date: 'bg-emerald-500/15 text-emerald-300',
  string: 'bg-fuchsia-500/15 text-fuchsia-300'
}

export default function SchemaTable({ schema, primaryKeyCandidate }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-edge">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-panel text-slate-400 text-left">
            <th className="px-4 py-3 font-medium">Column</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Nullable</th>
            <th className="px-4 py-3 font-medium">Unique</th>
            <th className="px-4 py-3 font-medium">Issues</th>
          </tr>
        </thead>
        <tbody>
          {schema.columns.map((col) => (
            <tr key={col.name} className="border-t border-edge hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-medium text-slate-200">
                {col.name}
                {col.name === primaryKeyCandidate && (
                  <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    PRIMARY KEY
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${TYPE_COLORS[col.inferredType] || ''}`}>
                  {col.inferredType.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{col.nullable ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3 text-slate-300">{col.isUnique ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3 text-amber-300/90 text-xs max-w-xs">
                {col.issues.length ? col.issues.join(' · ') : <span className="text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
