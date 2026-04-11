#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const featuresDir = path.join(repoRoot, 'features')
const featureFilePattern = /^features\/OBJ-\d+.*\.md$/
const placeholderPattern = /_To be added by \/([a-z-]+)_/gi

function unique(values) {
  return [...new Set(values)]
}

function runGit(command) {
  try {
    return execSync(command, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function listAllFeatureFiles() {
  if (!existsSync(featuresDir)) {
    return []
  }

  return readdirSync(featuresDir)
    .filter((entry) => /^OBJ-\d+.*\.md$/.test(entry))
    .map((entry) => `features/${entry}`)
    .sort((left, right) => left.localeCompare(right))
}

function listChangedFeatureFiles() {
  const changedWorkingTree = unique([
    ...runGit('git diff --name-only --diff-filter=ACMRTUXB'),
    ...runGit('git diff --name-only --cached --diff-filter=ACMRTUXB'),
  ])
  const untracked = runGit('git ls-files --others --exclude-standard')

  if (changedWorkingTree.length > 0 || untracked.length > 0) {
    return unique([...changedWorkingTree, ...untracked])
      .filter((filePath) => featureFilePattern.test(filePath))
      .sort((left, right) => left.localeCompare(right))
  }

  const eventPath = process.env.GITHUB_EVENT_PATH?.trim()
  if (eventPath && existsSync(eventPath)) {
    try {
      const eventPayload = JSON.parse(readFileSync(eventPath, 'utf8'))
      const headCommit = eventPayload?.head_commit
      if (headCommit) {
        return unique([
          ...(Array.isArray(headCommit.added) ? headCommit.added : []),
          ...(Array.isArray(headCommit.modified) ? headCommit.modified : []),
        ])
          .filter((filePath) => featureFilePattern.test(filePath))
          .sort((left, right) => left.localeCompare(right))
      }
    } catch {
      // Ignore malformed event payload and continue with git fallback.
    }
  }

  const changedFromHead = runGit(
    'git diff --name-only --diff-filter=ACMRTUXB HEAD~1..HEAD',
  )
  return changedFromHead
    .filter((filePath) => featureFilePattern.test(filePath))
    .sort((left, right) => left.localeCompare(right))
}

function findPlaceholders(content) {
  const findings = []
  for (const line of content.split('\n')) {
    const matches = [...line.matchAll(placeholderPattern)].map((entry) => entry[0])
    if (matches.length > 0) {
      findings.push(...matches)
    }
  }
  return findings
}

function parseFeatureStatus(content) {
  const match = content.match(/^## Status:\s*(.+)$/m)
  return match ? match[1].trim() : null
}

function shouldEnforceForStatus(status) {
  if (!status) {
    return true
  }
  const normalized = status.toLowerCase()
  return ['in review', 'completed', 'deployed'].includes(normalized)
}

function main() {
  const enforceAll = process.argv.includes('--all')
  const filesToCheck = enforceAll
    ? listAllFeatureFiles()
    : listChangedFeatureFiles()

  if (filesToCheck.length === 0) {
    console.log(
      'Placeholder check skipped: no changed feature files (use --all to enforce repo-wide).',
    )
    return
  }

  const violations = []
  let skippedByStatus = 0
  for (const relativeFile of filesToCheck) {
    const absoluteFile = path.join(repoRoot, relativeFile)
    if (!existsSync(absoluteFile)) {
      continue
    }
    const content = readFileSync(absoluteFile, 'utf8')
    const status = parseFeatureStatus(content)
    if (!shouldEnforceForStatus(status)) {
      skippedByStatus += 1
      continue
    }
    const placeholders = findPlaceholders(content)
    if (placeholders.length > 0) {
      violations.push({
        file: relativeFile,
        status: status ?? 'unknown',
        placeholders: unique(placeholders),
      })
    }
  }

  if (violations.length > 0) {
    console.error('Feature placeholder check failed.')
    for (const violation of violations) {
      console.error(
        `- ${violation.file} [Status: ${violation.status}]: ${violation.placeholders.join(', ')}`,
      )
    }
    console.error(
      'Resolve placeholders before merge: replace "_To be added by /..._" with real content.',
    )
    process.exitCode = 1
    return
  }

  console.log(
    `Feature placeholder check passed (${filesToCheck.length} changed feature files, ${skippedByStatus} skipped by status).`,
  )
}

main()
