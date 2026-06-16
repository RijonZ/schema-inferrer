// Infers a per-column schema (type, nullability, PK candidacy, anomalies) from raw row data.

const MISSING_TOKENS = new Set(['', 'na', 'n/a', 'null', 'nil', 'none', '-', '?', 'undefined'])

const TYPE_ORDER = ['integer', 'float', 'boolean', 'date', 'string']

function isMissing(value) {
  if (value === null || value === undefined) return true
  const s = String(value).trim().toLowerCase()
  return MISSING_TOKENS.has(s)
}

function detectAtomType(value) {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float'

  const s = String(value).trim()
  if (/^(true|false|yes|no)$/i.test(s)) return 'boolean'
  if (/^[+-]?\d+$/.test(s)) return 'integer'
  if (/^[+-]?\d*\.\d+$/.test(s) || /^[+-]?\d+\.\d*$/.test(s)) return 'float'
  if (/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/.test(s)) return 'date'
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return 'date'
  return 'string'
}

function widestType(types) {
  // Picks the most general type that can represent every observed atom type.
  const present = new Set(types)
  if (present.size === 1) return [...present][0]
  if (present.has('string')) return 'string'
  if (present.has('date')) return present.size === 1 ? 'date' : 'string'
  if (present.has('float') && (present.has('integer') || present.has('boolean'))) {
    return present.has('boolean') ? 'string' : 'float'
  }
  if (present.has('integer') && present.has('boolean')) return 'string'
  return TYPE_ORDER.find((t) => present.has(t)) || 'string'
}

function maxStringLength(values) {
  return values.reduce((max, v) => Math.max(max, String(v).length), 0)
}

function analyzeColumn(name, values) {
  const total = values.length
  const missingCount = values.filter(isMissing).length
  const present = values.filter((v) => !isMissing(v))
  const atomTypes = present.map(detectAtomType)
  const distinctTypes = [...new Set(atomTypes)]
  const inferredType = present.length ? widestType(atomTypes) : 'string'

  const distinctValues = new Set(present.map((v) => String(v).trim()))
  const isUnique = present.length > 0 && distinctValues.size === present.length
  const nullable = missingCount > 0

  const nameLooksLikeKey = /^(id|.*_id|uuid|guid|key|pk)$/i.test(name)
  const pkScore = (isUnique ? 2 : 0) + (!nullable ? 1 : 0) + (nameLooksLikeKey ? 2 : 0) + (inferredType === 'integer' ? 1 : 0)

  const issues = []
  if (distinctTypes.length > 1) {
    issues.push(`Mixed types detected: ${distinctTypes.join(', ')} -> coerced to ${inferredType.toUpperCase()}`)
  }
  if (nullable) {
    issues.push(`${missingCount}/${total} values missing (${((missingCount / total) * 100).toFixed(1)}%)`)
  }
  if (present.length && distinctValues.size === 1) {
    issues.push('Constant column: only one distinct value')
  }

  return {
    name,
    inferredType,
    nullable,
    missingCount,
    totalCount: total,
    distinctCount: distinctValues.size,
    isUnique,
    pkScore,
    maxLength: inferredType === 'string' ? maxStringLength(present) : null,
    sampleValues: present.slice(0, 5).map(String),
    issues
  }
}

export function inferSchema(headers, rows) {
  const columns = headers.map((name) => analyzeColumn(name, rows.map((r) => r[name])))

  const pkCandidate = columns
    .filter((c) => c.pkScore >= 3)
    .sort((a, b) => b.pkScore - a.pkScore)[0]

  return {
    rowCount: rows.length,
    columns,
    primaryKeyCandidate: pkCandidate ? pkCandidate.name : null
  }
}
