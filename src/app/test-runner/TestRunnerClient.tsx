'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ManualTest,
  OverallResult,
  StepStatus,
  TestCategory,
  TestRunState,
} from '@/lib/test-runner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

type TestState = TestRunState
const DEFAULT_TEST_DATE = new Date().toISOString().split('T')[0]

const TEST_CATEGORIES: TestCategory[] = [
  'Build',
  'Unit',
  'Integration',
  'API',
  'UI',
  'Deployability',
  'Unkategorisiert',
]

function validateTestRun(test: ManualTest, state: TestRunState): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!state.overallResult) {
    errors.push('Eine Gesamtbewertung ist erforderlich, bevor das Ergebnis gespeichert wird.')
  }
  if (!state.testDate || Number.isNaN(Date.parse(state.testDate))) {
    errors.push('Ein gueltiges Datum ist erforderlich.')
  }
  if (!state.steps.some((step) => step.status !== 'open')) {
    errors.push('Mindestens ein Schritt muss bewertet sein.')
  }

  if (!state.testerName.trim()) {
    warnings.push('Testername ist optional, aber fuer die Nachvollziehbarkeit empfohlen.')
  }
  if (!test.steps.length) {
    warnings.push('Der Testfall enthaelt keine Schritte und kann nur eingeschraenkt ausgewertet werden.')
  }

  return { errors, warnings }
}

function getInitialTestState(test: ManualTest): TestState {
  return {
    steps: test.steps.map((step) => ({ ...step })),
    preparations: test.preparations.map(() => false),
    currentStep: 0,
    overallResult: null,
    testerName: '',
    testDate: DEFAULT_TEST_DATE,
  }
}

function statusLabel(status: StepStatus): string {
  switch (status) {
    case 'open':
      return 'Offen'
    case 'passed':
      return 'Bestanden'
    case 'failed':
      return 'Nicht bestanden'
    case 'na':
      return 'Nicht anwendbar'
  }
}

function statusIcon(status: StepStatus): string {
  switch (status) {
    case 'open':
      return ''
    case 'passed':
      return '\u2705'
    case 'failed':
      return '\u274C'
    case 'na':
      return '\u23ED'
  }
}

function statusColor(status: StepStatus): string {
  switch (status) {
    case 'open':
      return 'text-muted-foreground'
    case 'passed':
      return 'text-green-600 dark:text-green-400'
    case 'failed':
      return 'text-red-600 dark:text-red-400'
    case 'na':
      return 'text-yellow-600 dark:text-yellow-400'
  }
}

function overallResultLabel(result: OverallResult): string {
  switch (result) {
    case 'passed':
      return '\u2705 Bestanden'
    case 'failed':
      return '\u274C Nicht bestanden'
    case 'na':
      return '\u23ED Nicht anwendbar'
    default:
      return ''
  }
}

function overallResultMd(result: OverallResult): string {
  switch (result) {
    case 'passed':
      return 'Bestanden'
    case 'failed':
      return 'Nicht bestanden'
    case 'na':
      return 'Nicht anwendbar'
    default:
      return 'Offen'
  }
}

function stepStatusMd(status: StepStatus): string {
  switch (status) {
    case 'passed':
      return 'Bestanden'
    case 'failed':
      return 'Nicht bestanden'
    case 'na':
      return 'N/A'
    default:
      return 'Offen'
  }
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br />')
}

function getObjHint(test: ManualTest): string {
  const hintMatch =
    test.filePath.match(/(OBJ-\d+)/i) ?? test.requirementId.match(/(OBJ-\d+)/i)
  return hintMatch ? hintMatch[1].toUpperCase() : ''
}

function slugifyForOft(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveOftTag(test: ManualTest): string {
  const existing = test.oftTag.trim()
  if (existing) {
    return existing
  }

  const fallbackId = slugifyForOft(
    test.id.replace(/^test-/i, '') || test.requirementId || 'manual-test'
  )
  return `itest~${fallbackId || 'manual-test'}~1`
}

function resolveOftCovers(test: ManualTest): string {
  const existing = test.oftCovers.trim()
  if (existing) {
    return existing
  }

  const requirement = slugifyForOft(test.requirementId)
  return requirement ? `req~${requirement}~1` : 'req~unknown~1'
}

function hasUnsavedRunChanges(state: TestState): boolean {
  if (state.overallResult !== null) {
    return true
  }
  if (state.testerName.trim().length > 0) {
    return true
  }
  if (state.testDate !== DEFAULT_TEST_DATE) {
    return true
  }
  if (state.preparations.some((prep) => prep)) {
    return true
  }

  return state.steps.some(
    (step) => step.status !== 'open' || step.observation.trim().length > 0
  )
}

function buildResultMarkdown(test: ManualTest, state: TestState): string {
  const date = state.testDate
  const tester = state.testerName.trim() || 'Nicht angegeben'
  const objHint = getObjHint(test)
  const hasStepExpectation = state.steps.some((step) => step.expectedResult)
  const oftTag = resolveOftTag(test)
  const oftCovers = resolveOftCovers(test)

  const lines: string[] = []

  lines.push('---')
  lines.push(`test_id: ${test.id}`)
  lines.push(`requirement_id: ${test.requirementId || 'unknown'}`)
  lines.push(`service_function_id: ${test.serviceFunctionId || 'unknown'}`)
  lines.push(`service_function_name: ${test.serviceFunctionName || 'unknown'}`)
  lines.push(`category: ${test.category}`)
  lines.push(`tester: ${state.testerName.trim() || ''}`)
  lines.push(`date: ${date}`)
  if (objHint) {
    lines.push(`obj_hint: ${objHint}`)
  }
  lines.push('---')
  lines.push('')
  lines.push(`# TEST-RESULT-${test.id} - ${date}`)
  lines.push('')

  lines.push(`\`${oftTag}\``)
  lines.push(`Covers: ${oftCovers}`)
  lines.push('')

  lines.push('## Ausfuehrungsmetadaten')
  lines.push('')
  lines.push('| Feld | Wert |')
  lines.push('|------|------|')
  lines.push(`| Test-ID | ${escapeMarkdownCell(test.id)} |`)
  lines.push(`| Requirement | ${escapeMarkdownCell(test.requirementId || 'n/a')} |`)
  lines.push(`| Kategorie | ${escapeMarkdownCell(test.category)} |`)
  lines.push(
    `| Service Function | ${escapeMarkdownCell(
      `${test.serviceFunctionId || 'n/a'} - ${test.serviceFunctionName || 'n/a'}`
    )} |`
  )
  lines.push(`| Tester | ${escapeMarkdownCell(tester)} |`)
  lines.push(`| Datum | ${escapeMarkdownCell(date)} |`)
  lines.push(
    `| Gesamtbewertung | ${escapeMarkdownCell(overallResultMd(state.overallResult))} |`
  )
  if (objHint) {
    lines.push(`| OBJ-Hinweis | ${escapeMarkdownCell(objHint)} |`)
  }
  lines.push(`| OFT-Tag | ${escapeMarkdownCell(oftTag)} |`)
  lines.push(`| Covers | ${escapeMarkdownCell(oftCovers)} |`)
  lines.push('')

  if (!state.testerName.trim()) {
    lines.push(
      '> Hinweis: Der Testername ist optional, aber fuer die Nachvollziehbarkeit empfohlen.'
    )
    lines.push('')
  }

  lines.push('## Schrittprotokoll')
  lines.push('')

  if (hasStepExpectation) {
    lines.push('| Schritt | Status | Erwartung | Beobachtung |')
    lines.push('|---------|--------|-----------|-------------|')
  } else {
    lines.push('| Schritt | Status | Beobachtung |')
    lines.push('|---------|--------|-------------|')
  }

  for (const step of state.steps) {
    const observation = step.observation || '\u2013'
    if (hasStepExpectation) {
      lines.push(
        `| ${step.number} | ${stepStatusMd(step.status)} | ${
          escapeMarkdownCell(step.expectedResult ?? '\u2013')
        } | ${escapeMarkdownCell(observation)} |`
      )
    } else {
      lines.push(
        `| ${step.number} | ${stepStatusMd(step.status)} | ${escapeMarkdownCell(
          observation
        )} |`
      )
    }
  }

  lines.push('')
  lines.push('---')
  lines.push('_Generiert durch den Manual Test Runner_')
  lines.push(
    `_Datei committen nach: tests/results/TEST-RESULT-${test.id}-${date}.md_`
  )
  lines.push('')

  return lines.join('\n')
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

interface TestRunnerClientProps {
  tests: ManualTest[]
}

export function TestRunnerClient({ tests }: TestRunnerClientProps) {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(
    tests[0]?.id ?? null
  )
  const [activeCategories, setActiveCategories] =
    useState<TestCategory[]>(TEST_CATEGORIES)
  const [testStates, setTestStates] = useState<Record<string, TestState>>(() => {
    const initial: Record<string, TestState> = {}
    for (const test of tests) {
      initial[test.id] = getInitialTestState(test)
    }
    return initial
  })

  const activeCategorySet = useMemo(
    () => new Set(activeCategories),
    [activeCategories]
  )

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      TEST_CATEGORIES.map((category) => [category, 0])
    ) as Record<TestCategory, number>

    for (const test of tests) {
      counts[test.category] += 1
    }

    return counts
  }, [tests])

  const visibleTests = useMemo(
    () => tests.filter((test) => activeCategorySet.has(test.category)),
    [tests, activeCategorySet]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, ManualTest[]> = {}
    for (const test of visibleTests) {
      const key = test.serviceFunctionName
      if (!groups[key]) groups[key] = []
      groups[key].push(test)
    }
    return groups
  }, [visibleTests])

  const selectedTest = visibleTests.find((t) => t.id === selectedTestId) ?? null
  const effectiveSelectedTest = selectedTest ?? visibleTests[0] ?? null
  const effectiveSelectedTestId = effectiveSelectedTest?.id ?? null
  const state = effectiveSelectedTestId ? testStates[effectiveSelectedTestId] : null

  const updateState = useCallback(
    (testId: string, updater: (prev: TestState) => TestState) => {
      const fallbackTest = tests[0] as ManualTest
      setTestStates((prev) => ({
        ...prev,
        [testId]: updater(prev[testId] ?? getInitialTestState(fallbackTest)),
      }))
    },
    [tests]
  )

  const toggleCategory = (category: TestCategory) => {
    setActiveCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((value) => value !== category)
      }
      return [...prev, category]
    })
  }

  if (tests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Manual Test Runner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Keine manuellen Testdateien gefunden. Stellen Sie sicher, dass
              Testdateien im Verzeichnis{' '}
              <code className="text-sm bg-muted px-1 py-0.5 rounded">
                capabilities/
              </code>{' '}
              vorhanden sind.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div>
            <h1 className="text-lg font-semibold">Manual Test Runner</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {visibleTests.length} von {tests.length} Tests sichtbar
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                activeCategories.length === TEST_CATEGORIES.length
                  ? 'default'
                  : 'outline'
              }
              className="h-8"
              onClick={() => setActiveCategories(TEST_CATEGORIES)}
            >
              Alle
            </Button>
            {TEST_CATEGORIES.map((category) => {
              const active = activeCategorySet.has(category)
              return (
                <Button
                  key={category}
                  type="button"
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  className="h-8"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="mr-2">{category}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {categoryCounts[category]}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-2" aria-label="Test list">
            {visibleTests.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                Keine Tests entsprechen den aktiven Filtern.
              </div>
            ) : (
              Object.entries(grouped).map(([sfName, sfTests]) => (
                <div key={sfName} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                      {sfName}
                    </span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {sfTests.length}
                    </Badge>
                  </div>
                  <ul className="space-y-0.5">
                    {sfTests.map((test) => {
                      const ts = testStates[test.id]
                      const completedSteps = ts.steps.filter(
                        (step) => step.status !== 'open'
                      ).length
                      const isSelected = test.id === effectiveSelectedTestId
                      return (
                        <li key={test.id}>
                          <button
                            onClick={() => setSelectedTestId(test.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            aria-current={isSelected ? 'page' : undefined}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="block font-mono text-xs truncate">
                                {test.id}
                              </span>
                              <Badge
                                variant={isSelected ? 'secondary' : 'outline'}
                                className="shrink-0 text-[10px]"
                              >
                                {test.category}
                              </Badge>
                            </span>
                            <span
                              className={`block text-xs mt-0.5 ${
                                isSelected
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {test.requirementId || 'n/a'} &middot; {completedSteps}/
                              {ts.steps.length}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))
            )}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {effectiveSelectedTest && state ? (
          <TestPanel
            test={effectiveSelectedTest}
            state={state}
            onUpdate={(updater) =>
              updateState(effectiveSelectedTest.id, updater)
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {visibleTests.length === 0
              ? 'Keine Tests entsprechen den aktiven Filtern.'
              : 'Waehlen Sie einen Test aus der Seitenleiste.'}
          </div>
        )}
      </main>
    </div>
  )
}

interface TestPanelProps {
  test: ManualTest
  state: TestState
  onUpdate: (updater: (prev: TestState) => TestState) => void
}

function TestPanel({ test, state, onUpdate }: TestPanelProps) {
  const validation = useMemo(() => validateTestRun(test, state), [test, state])
  const completedSteps = state.steps.filter((step) => step.status !== 'open').length
  const totalSteps = state.steps.length
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  const allStepsDone = completedSteps === totalSteps && totalSteps > 0
  const currentStep = state.steps[state.currentStep] ?? null
  const canDownload = validation.errors.length === 0
  const hasUnsavedChanges = useMemo(() => hasUnsavedRunChanges(state), [state])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue =
        'Ungespeicherte Testeingaben vorhanden. Bei Verlassen gehen diese verloren.'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const setStepStatus = (index: number, status: StepStatus) => {
    onUpdate((prev) => {
      const steps = prev.steps.map((step, i) =>
        i === index ? { ...step, status } : step
      )
      return { ...prev, steps }
    })
  }

  const setStepObservation = (index: number, observation: string) => {
    onUpdate((prev) => {
      const steps = prev.steps.map((step, i) =>
        i === index ? { ...step, observation } : step
      )
      return { ...prev, steps }
    })
  }

  const setPreparation = (index: number, checked: boolean) => {
    onUpdate((prev) => {
      const preparations = [...prev.preparations]
      preparations[index] = checked
      return { ...prev, preparations }
    })
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      onUpdate((prev) => ({ ...prev, currentStep: index }))
    }
  }

  const handleDownload = () => {
    if (!canDownload) {
      return
    }

    const md = buildResultMarkdown(test, state)
    const filename = `TEST-RESULT-${test.id}-${state.testDate}.md`
    downloadFile(filename, md)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold font-mono">{test.id}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline">{test.requirementId || 'n/a'}</Badge>
          <Badge variant="secondary">{test.serviceFunctionId || 'n/a'}</Badge>
          <Badge variant="outline">{test.category}</Badge>
          {test.estimatedDuration && (
            <Badge variant="secondary">{test.estimatedDuration}</Badge>
          )}
        </div>
        {test.oftTag && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            {test.oftTag}
          </p>
        )}
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Testvorbereitung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {test.preparations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Vorbereitungsschritte definiert.
            </p>
          ) : (
            test.preparations.map((prep, index) => (
              <label key={index} className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={state.preparations[index]}
                  onCheckedChange={(checked) =>
                    setPreparation(index, checked === true)
                  }
                  aria-label={`Vorbereitung: ${prep}`}
                  className="mt-0.5"
                />
                <span
                  className={`text-sm ${
                    state.preparations[index]
                      ? 'line-through text-muted-foreground'
                      : ''
                  }`}
                >
                  {prep}
                </span>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Fortschritt</span>
          <span className="text-muted-foreground">
            {completedSteps} von {totalSteps} Schritten
          </span>
        </div>
        <Progress value={progressPercent} aria-label="Testfortschritt" />
        {hasUnsavedChanges ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Ungespeicherte Aenderungen vorhanden. Bitte Ergebnis herunterladen, bevor du die Seite verlaesst.
          </p>
        ) : null}
      </div>

      <div className="flex gap-1" role="group" aria-label="Schritte">
        {state.steps.map((step, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className={`h-8 flex-1 rounded text-xs font-medium transition-colors border ${
              index === state.currentStep ? 'ring-2 ring-primary ring-offset-1' : ''
            } ${
              step.status === 'open'
                ? 'bg-muted text-muted-foreground border-border'
                : step.status === 'passed'
                  ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                  : step.status === 'failed'
                    ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
            }`}
            aria-label={`Schritt ${step.number}: ${statusLabel(step.status)}`}
          >
            {step.number}
          </button>
        ))}
      </div>

      {currentStep && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                Schritt {currentStep.number} von {totalSteps}
              </CardTitle>
              <span className={`text-sm font-medium ${statusColor(currentStep.status)}`}>
                {statusIcon(currentStep.status)} {statusLabel(currentStep.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{currentStep.description}</p>

            {currentStep.expectedResult && (
              <p className="text-sm text-muted-foreground">
                Erwartung: {currentStep.expectedResult}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={currentStep.status === 'passed' ? 'default' : 'outline'}
                onClick={() => setStepStatus(state.currentStep, 'passed')}
                className={
                  currentStep.status === 'passed'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : ''
                }
              >
                Bestanden
              </Button>
              <Button
                size="sm"
                variant={currentStep.status === 'failed' ? 'default' : 'outline'}
                onClick={() => setStepStatus(state.currentStep, 'failed')}
                className={
                  currentStep.status === 'failed'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : ''
                }
              >
                Nicht bestanden
              </Button>
              <Button
                size="sm"
                variant={currentStep.status === 'na' ? 'default' : 'outline'}
                onClick={() => setStepStatus(state.currentStep, 'na')}
                className={
                  currentStep.status === 'na'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : ''
                }
              >
                Nicht anwendbar
              </Button>
              {currentStep.status !== 'open' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStepStatus(state.currentStep, 'open')}
                >
                  Zuruecksetzen
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="step-observation" className="text-sm font-medium">
                Beobachtung
              </label>
              <Textarea
                id="step-observation"
                placeholder="Beobachtungen zu diesem Schritt..."
                value={currentStep.observation}
                onChange={(e) =>
                  setStepObservation(state.currentStep, e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(state.currentStep - 1)}
                disabled={state.currentStep === 0}
              >
                Vorheriger Schritt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(state.currentStep + 1)}
                disabled={state.currentStep >= totalSteps - 1}
              >
                Naechster Schritt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {test.expectedResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Erwartetes Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{test.expectedResult}</p>
          </CardContent>
        </Card>
      )}

      {allStepsDone && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gesamtbewertung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={state.overallResult === 'passed' ? 'default' : 'outline'}
                onClick={() =>
                  onUpdate((prev) => ({ ...prev, overallResult: 'passed' }))
                }
                className={
                  state.overallResult === 'passed'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : ''
                }
              >
                Bestanden
              </Button>
              <Button
                variant={state.overallResult === 'failed' ? 'default' : 'outline'}
                onClick={() =>
                  onUpdate((prev) => ({ ...prev, overallResult: 'failed' }))
                }
                className={
                  state.overallResult === 'failed'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : ''
                }
              >
                Nicht bestanden
              </Button>
              <Button
                variant={state.overallResult === 'na' ? 'default' : 'outline'}
                onClick={() =>
                  onUpdate((prev) => ({ ...prev, overallResult: 'na' }))
                }
                className={
                  state.overallResult === 'na'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : ''
                }
              >
                Nicht anwendbar
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="tester-name" className="text-sm font-medium">
                  Getestet von
                </label>
                <Input
                  id="tester-name"
                  placeholder="Name"
                  value={state.testerName}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      testerName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="test-date" className="text-sm font-medium">
                  Datum
                </label>
                <Input
                  id="test-date"
                  type="date"
                  value={state.testDate}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      testDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-2">
                {validation.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium text-red-700 dark:text-red-400">
                      Vor dem Download muessen diese Punkte erfuellt sein:
                    </p>
                    <ul className="list-disc pl-5 text-red-700 dark:text-red-400 space-y-1">
                      {validation.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Hinweis
                    </p>
                    <ul className="list-disc pl-5 text-amber-700 dark:text-amber-400 space-y-1">
                      {validation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {state.overallResult && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  {overallResultLabel(state.overallResult)}
                </p>
                <Button
                  onClick={handleDownload}
                  className="w-full sm:w-auto"
                  disabled={!canDownload}
                >
                  Ergebnis herunterladen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
