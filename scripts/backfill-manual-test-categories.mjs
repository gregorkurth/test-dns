#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const capabilitiesRoot = path.join(repoRoot, 'capabilities')

const CATEGORY_VALUES = new Set([
  'Build',
  'Unit',
  'Integration',
  'API',
  'UI',
  'Deployability',
  'Unkategorisiert',
])

function normalizeCategory(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') {
    return null
  }

  const normalized = rawValue.trim().toLowerCase()
  if (
    ['build', 'builds', 'release build', 'release-build', 'release'].includes(
      normalized,
    )
  ) {
    return 'Build'
  }
  if (['unit', 'unit test', 'unit tests', 'test unit'].includes(normalized)) {
    return 'Unit'
  }
  if (
    ['integration', 'integrations', 'e2e', 'end-to-end'].includes(normalized)
  ) {
    return 'Integration'
  }
  if (['api', 'rest api', 'openapi', 'swagger'].includes(normalized)) {
    return 'API'
  }
  if (['ui', 'gui', 'frontend', 'browser'].includes(normalized)) {
    return 'UI'
  }
  if (
    ['deployability', 'deployment', 'deploy', 'release deploy'].includes(
      normalized,
    )
  ) {
    return 'Deployability'
  }
  if (normalized === 'unkategorisiert') {
    return 'Unkategorisiert'
  }
  return null
}

function inferCategoryFromContent(content, filePath) {
  const haystack = `${filePath}\n${content}`.toLowerCase()

  if (
    /deploy|deployment|zarf|smoke[- ]?test|target import|package deploy|kubectl get pods|import/.test(
      haystack,
    )
  ) {
    return 'Deployability'
  }
  if (/api|openapi|swagger|endpoint|rest api|http|curl|postman/.test(haystack)) {
    return 'API'
  }
  if (/ui|gui|dashboard|frontend|browser|webseite|screen|view/.test(haystack)) {
    return 'UI'
  }
  if (
    /build|release build|image|container|dockerfile|sbom|artifact|packaging|trivy image/.test(
      haystack,
    )
  ) {
    return 'Build'
  }
  if (
    /integration|reconciliation|sync|workflow|e2e|end-to-end|logging|audit|telemetry|event/.test(
      haystack,
    )
  ) {
    return 'Integration'
  }
  if (/\bunit\b|parser|validator|validation|helper|utility|\bfunction\b/.test(haystack)) {
    return 'Unit'
  }

  return 'Unkategorisiert'
}

function findManualFiles(dir) {
  /** @type {string[]} */
  const files = []
  if (!fs.existsSync(dir)) {
    return files
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findManualFiles(absolute))
      continue
    }
    if (
      entry.isFile() &&
      entry.name.endsWith('-manual.md') &&
      absolute.includes(path.join('tests', 'manual'))
    ) {
      files.push(absolute)
    }
  }

  return files
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)
  if (!match) {
    return {
      hasFrontmatter: false,
      metadataLines: [],
      body: content,
    }
  }

  return {
    hasFrontmatter: true,
    metadataLines: match[1].split('\n'),
    body: content.slice(match[0].length),
  }
}

function extractCategoryFromFrontmatter(lines) {
  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(category|kategorie)\s*:\s*(.+)$/i)
    if (!match) {
      continue
    }

    const value = match[2].trim().replace(/^["']/, '').replace(/["']$/, '')
    const normalized = normalizeCategory(value)
    if (normalized) {
      return normalized
    }
  }
  return null
}

function buildFileWithCategory(content, category) {
  const parsed = parseFrontmatter(content)
  const filteredLines = parsed.metadataLines.filter(
    (line) => !/^\s*(category|kategorie)\s*:/i.test(line),
  )
  const nextFrontmatter = [`category: ${category}`, ...filteredLines]
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line, index, all) => !(line.trim().length === 0 && index === all.length - 1))
  const frontmatterBlock = `---\n${nextFrontmatter.join('\n')}\n---\n\n`
  return `${frontmatterBlock}${parsed.body.replace(/^\n*/, '')}`
}

function main() {
  const files = findManualFiles(capabilitiesRoot)
  let changed = 0

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, 'utf8')
    const parsed = parseFrontmatter(original)
    const explicitCategory = extractCategoryFromFrontmatter(parsed.metadataLines)
    const inferredCategory = inferCategoryFromContent(
      parsed.body || original,
      path.relative(repoRoot, filePath),
    )
    const category = explicitCategory || inferredCategory
    const safeCategory = CATEGORY_VALUES.has(category) ? category : 'Unkategorisiert'
    const next = buildFileWithCategory(original, safeCategory)

    if (next !== original) {
      fs.writeFileSync(filePath, next, 'utf8')
      changed += 1
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned: files.length,
        changed,
      },
      null,
      2,
    ),
  )
}

main()
