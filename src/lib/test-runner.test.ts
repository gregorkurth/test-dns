import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  loadManualTests,
  parseManualTestMarkdown,
  validateTestRun,
  type ManualTest,
  type TestRunState,
} from './test-runner'

function createState(
  test: ManualTest,
  overrides: Partial<TestRunState> = {}
): TestRunState {
  return {
    steps: test.steps.map((step) => ({ ...step })),
    preparations: test.preparations.map(() => false),
    currentStep: 0,
    overallResult: 'passed',
    testerName: 'Test User',
    testDate: '2026-04-09',
    ...overrides,
  }
}

describe('loadManualTests', () => {
  it('loads manual tests from capabilities with categories', async () => {
    const tests = await loadManualTests()

    expect(tests.length).toBeGreaterThan(0)
    expect(tests.every((test) => typeof test.category === 'string')).toBe(true)
    expect(tests.some((test) => test.category === 'Build')).toBe(true)
  })

  it('enforces explicit category frontmatter on all manual tests', () => {
    const manualFiles: string[] = []
    const root = path.join(process.cwd(), 'capabilities')

    function walk(dir: string): void {
      if (!fs.existsSync(dir)) {
        return
      }

      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(absolute)
          continue
        }

        if (
          entry.isFile() &&
          entry.name.endsWith('-manual.md') &&
          absolute.includes(path.join('tests', 'manual'))
        ) {
          manualFiles.push(absolute)
        }
      }
    }

    walk(root)

    const missing: string[] = []
    const duplicates: string[] = []

    for (const filePath of manualFiles) {
      const content = fs.readFileSync(filePath, 'utf8')
      const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)
      if (!match) {
        missing.push(path.relative(process.cwd(), filePath))
        continue
      }

      const categoryLines = match[1]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^category\s*:/i.test(line))

      if (categoryLines.length === 0) {
        missing.push(path.relative(process.cwd(), filePath))
      } else if (categoryLines.length > 1) {
        duplicates.push(path.relative(process.cwd(), filePath))
      }
    }

    expect(missing).toEqual([])
    expect(duplicates).toEqual([])
  })
})

describe('parseManualTestMarkdown', () => {
  it('parses the classic numbered markdown format', () => {
    const content = `---
category: Build
---
# TEST-RDTS-707-001-manual: Manueller Test

> **Requirement:** [RDTS-707](../../requirements/RDTS-707.md)
> **Geschaetzte Dauer:** 15 Minuten

## Testvorbereitung

- Docker-Image gebaut
- Zugriff auf Logs vorhanden

## Testschritte

1. Release-Build ausloesen
2. trivy image Scan-Ergebnis pruefen
3. Kein kritisches Finding vorhanden

## Erwartetes Ergebnis

Der Build ist sicher und das Ergebnis ist dokumentiert.
`

    const test = parseManualTestMarkdown(
      'capabilities/example/service-functions/SFN-EX-001-example/tests/manual/TEST-RDTS-707-001-manual.md',
      content
    )

    expect(test).toMatchObject({
      requirementId: 'RDTS-707',
      category: 'Build',
      estimatedDuration: '15 Minuten',
      preparations: ['Docker-Image gebaut', 'Zugriff auf Logs vorhanden'],
      expectedResult: 'Der Build ist sicher und das Ergebnis ist dokumentiert.',
    })
    expect(test.steps).toHaveLength(3)
    expect(test.steps[0]).toMatchObject({
      number: 1,
      description: 'Release-Build ausloesen',
      status: 'open',
    })
  })

  it('parses step tables and infers the category', () => {
    const content = `# TEST-RDTS-805-001-manual: Manueller Test

> **Requirement:** [RDTS-805](../../requirements/RDTS-805.md)

## Testvorbereitung
- Zarf-Paket vorhanden
- Zielumgebung erreichbar

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | zarf package deploy ausführen | Alle Images werden importiert | ☐ |
| 2 | kubectl get pods prüfen | Pods laufen erfolgreich | ☐ |
| 3 | Smoke-Test ausführen | App ist erreichbar | ☐ |
`

    const test = parseManualTestMarkdown(
      'capabilities/example/service-functions/SFN-OFD-002-zarf-deploy/tests/manual/TEST-RDTS-805-001-manual.md',
      content
    )

    expect(test.category).toBe('Deployability')
    expect(test.preparations).toEqual([
      'Zarf-Paket vorhanden',
      'Zielumgebung erreichbar',
    ])
    expect(test.steps).toHaveLength(3)
    expect(test.steps[0]).toMatchObject({
      description: 'zarf package deploy ausführen',
      expectedResult: 'Alle Images werden importiert',
    })
    expect(test.steps[2]).toMatchObject({
      description: 'Smoke-Test ausführen',
      expectedResult: 'App ist erreichbar',
    })
  })

  it('falls back to Unkategorisiert when no category can be inferred', () => {
    const content = `# TEST-RDTS-999-001-manual: Manueller Test

## Testschritte

1. Foo prüfen
2. Bar prüfen
`

    const test = parseManualTestMarkdown(
      'capabilities/example/service-functions/SFN-EX-999-example/tests/manual/TEST-RDTS-999-001-manual.md',
      content
    )

    expect(test.category).toBe('Unkategorisiert')
    expect(test.steps).toHaveLength(2)
  })
})

describe('validateTestRun', () => {
  it('requires overall rating, date and at least one rated step', () => {
    const test = parseManualTestMarkdown(
      'capabilities/example/service-functions/SFN-EX-001-example/tests/manual/TEST-RDTS-707-001-manual.md',
      `---
category: Build
---
# TEST-RDTS-707-001-manual: Manueller Test

## Testschritte
1. Schritt eins
2. Schritt zwei
`
    )

    const invalidState = createState(test, {
      overallResult: null,
      testDate: '',
      testerName: '',
      steps: test.steps.map((step) => ({ ...step, status: 'open' })),
    })

    const validation = validateTestRun(test, invalidState)

    expect(validation.errors).toEqual(
      expect.arrayContaining([
        'Eine Gesamtbewertung ist erforderlich, bevor das Ergebnis gespeichert wird.',
        'Ein gueltiges Datum ist erforderlich.',
        'Mindestens ein Schritt muss bewertet sein.',
      ])
    )
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Testername ist optional'),
      ])
    )
  })

  it('allows download once the required fields are filled', () => {
    const test = parseManualTestMarkdown(
      'capabilities/example/service-functions/SFN-OFD-002-zarf-deploy/tests/manual/TEST-RDTS-805-001-manual.md',
      `---
category: Deployability
---
# TEST-RDTS-805-001-manual: Manueller Test

## Testschritte
1. Paket prüfen
2. Deploy testen
`
    )

    const validState = createState(test, {
      overallResult: 'failed',
      testerName: '',
      steps: test.steps.map((step, index) =>
        index === 0 ? { ...step, status: 'failed' } : step
      ),
    })

    const validation = validateTestRun(test, validState)

    expect(validation.errors).toEqual([])
    expect(validation.warnings).toEqual([
      'Testername ist optional, aber fuer die Nachvollziehbarkeit empfohlen.',
    ])
  })
})
