import { useRef, useState } from 'react'

export default function UploadZone({ onFileSelected, loading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFiles = (files) => {
    const file = files?.[0]
    if (!file) return
    setFileName(file.name)
    onFileSelected(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors
        ${dragOver ? 'border-accent2 bg-accent2/5' : 'border-edge hover:border-accent'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-4xl mb-3">📂</div>
      <p className="text-slate-200 font-medium">
        {loading ? 'Analyzing...' : 'Drag a CSV/JSON file here, or click to browse'}
      </p>
      {fileName && !loading && (
        <p className="mt-2 text-sm text-accent2">{fileName}</p>
      )}
      <p className="mt-1 text-xs text-slate-500">Max 5MB</p>
    </div>
  )
}
