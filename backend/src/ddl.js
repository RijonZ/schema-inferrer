// Generates a CREATE TABLE statement from an inferred schema.

function sqlType(column) {
  switch (column.inferredType) {
    case 'integer':
      return 'INTEGER'
    case 'float':
      return 'DOUBLE PRECISION'
    case 'boolean':
      return 'BOOLEAN'
    case 'date':
      return 'TIMESTAMP'
    default: {
      const len = Math.max(column.maxLength || 0, 1)
      return len > 255 ? 'TEXT' : `VARCHAR(${Math.min(Math.ceil(len * 1.5), 255)})`
    }
  }
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`
}

export function generateDdl(tableName, schema) {
  const lines = schema.columns.map((col) => {
    const parts = [quoteIdent(col.name), sqlType(col)]
    if (!col.nullable) parts.push('NOT NULL')
    if (col.name === schema.primaryKeyCandidate) parts.push('PRIMARY KEY')
    return '  ' + parts.join(' ')
  })

  return `CREATE TABLE ${quoteIdent(tableName)} (\n${lines.join(',\n')}\n);`
}
