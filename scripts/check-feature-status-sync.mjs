#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const featureIndexPath = path.join(repoRoot, 'features', 'INDEX.md')
const allowedStatuses = new Set([
  'Planned',
  'In Progress',
  'In Review',
  'Completed',
  'Deployed',
])

function parseIndexRows(content) {
  const rows = []
  for (const line of content.split('\n')) {
    const match = line.match(
      /^\|\s*(OBJ-\d+)\s*\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+?)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*[0-9-]+\s*\|$/i,
    )
    if (!match) {
      continue
    }

    rows.push({
      objId: match[1].toUpperCase(),
      indexStatus: match[2].trim(),
      specPath: path.join(repoRoot, 'features', match[4].trim()),
      specRef: match[4].trim(),
    })
  }
  return rows
}

function parseSpecStatus(content) {
  const match = content.match(/^## Status:\s*(.+)$/m)
  return match ? match[1].trim() : null
}

function main() {
  if (!existsSync(featureIndexPath)) {
    console.error('Feature status sync check failed.')
    console.error('- features/INDEX.md fehlt')
    process.exitCode = 1
    return
  }

  const indexContent = readFileSync(featureIndexPath, 'utf8')
  const rows = parseIndexRows(indexContent)
  if (rows.length === 0) {
    console.error('Feature status sync check failed.')
    console.error('- Keine OBJ-Zeilen in features/INDEX.md gefunden')
    process.exitCode = 1
    return
  }

  const seen = new Set()
  const errors = []

  for (const row of rows) {
    if (seen.has(row.objId)) {
      errors.push(`${row.objId}: doppelte Zeile im Feature-Index`)
      continue
    }
    seen.add(row.objId)

    if (!allowedStatuses.has(row.indexStatus)) {
      errors.push(
        `${row.objId}: ungueltiger INDEX-Status "${row.indexStatus}" (erlaubt: ${Array.from(
          allowedStatuses,
        ).join(', ')})`,
      )
      continue
    }

    if (!existsSync(row.specPath)) {
      errors.push(`${row.objId}: Spec-Datei fehlt (${row.specRef})`)
      continue
    }

    const specContent = readFileSync(row.specPath, 'utf8')
    const specStatus = parseSpecStatus(specContent)
    if (!specStatus) {
      errors.push(`${row.objId}: Spec-Status fehlt in ${row.specRef}`)
      continue
    }
    if (!allowedStatuses.has(specStatus)) {
      errors.push(`${row.objId}: ungueltiger Spec-Status "${specStatus}" in ${row.specRef}`)
      continue
    }

    if (row.indexStatus !== specStatus) {
      errors.push(
        `${row.objId}: Status-Mismatch (INDEX="${row.indexStatus}" vs SPEC="${specStatus}")`,
      )
    }
  }

  if (errors.length > 0) {
    console.error('Feature status sync check failed.')
    for (const entry of errors) {
      console.error(`- ${entry}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Feature status sync check passed (${rows.length} features).`)
}

main()
