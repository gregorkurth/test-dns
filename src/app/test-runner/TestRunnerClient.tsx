'use client'

import { useState, useMemo, useCallback } from 'react'
import type { ManualTest, StepStatus, TestStep } from '@/lib/test-runner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

type OverallResult = 'passed' | 'failed' | 'na' | null

interface TestState {
  steps: TestStep[]
  preparations: boolean[]
  currentStep: number
  overallResult: OverallResult
  testerName: string
  testDate: string
}

function getInitialTestState(test: ManualTest): TestState {
  return {
    steps: test.steps.map((s) => ({ ...s })),
    preparations: test.preparations.map(() => false),
    currentStep: 0,
    overallResult: null,
    testerName: '',
    testDate: new Date().toISOString().split('T')[0],
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

function generateResultMarkdown(
  test: ManualTest,
  state: TestState
): string {
  const date = state.testDate
  const lines: string[] = []

  lines.push(`# TEST-RESULT-${test.id} \u2013 ${date}`)
  lines.push('')

  if (test.oftTag) {
    lines.push(`\`${test.oftTag}~result~1\``)
  }
  if (test.oftCovers) {
    lines.push(`Covers: ${test.oftCovers}`)
  }
  if (test.oftTag || test.oftCovers) {
    lines.push('')
  }

  lines.push('| Schritt | Status | Beobachtung |')
  lines.push('|---------|--------|-------------|')
  for (const step of state.steps) {
    const obs = step.observation || '\u2013'
    lines.push(`| ${step.number} | ${stepStatusMd(step.status)} | ${obs} |`)
  }
  lines.push('')
  lines.push(`**Gesamtbewertung:** ${overallResultMd(state.overallResult)}`)
  lines.push(`**Getestet von:** ${state.testerName || '_________________'}`)
  lines.push(`**Datum:** ${date}`)
  lines.push('')
  lines.push('---')
  lines.push('_Generiert durch DNS Tool Manual Test Runner_')
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

// -------------------------------------------------------------------
// Components
// -------------------------------------------------------------------

interface TestRunnerClientProps {
  tests: ManualTest[]
}

export function TestRunnerClient({ tests }: TestRunnerClientProps) {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(
    tests.length > 0 ? tests[0].id : null
  )
  const [testStates, setTestStates] = useState<Record<string, TestState>>(() => {
    const initial: Record<string, TestState> = {}
    for (const test of tests) {
      initial[test.id] = getInitialTestState(test)
    }
    return initial
  })

  const grouped = useMemo(() => {
    const groups: Record<string, ManualTest[]> = {}
    for (const test of tests) {
      const key = test.serviceFunctionName
      if (!groups[key]) groups[key] = []
      groups[key].push(test)
    }
    return groups
  }, [tests])

  const selectedTest = tests.find((t) => t.id === selectedTestId) ?? null
  const state = selectedTestId ? testStates[selectedTestId] : null

  const updateState = useCallback(
    (testId: string, updater: (prev: TestState) => TestState) => {
      setTestStates((prev) => ({
        ...prev,
        [testId]: updater(prev[testId]),
      }))
    },
    []
  )

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
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">Manual Test Runner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tests.length} Tests
          </p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2" aria-label="Test list">
            {Object.entries(grouped).map(([sfName, sfTests]) => (
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
                      (s) => s.status !== 'open'
                    ).length
                    const isSelected = test.id === selectedTestId
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
                          <span className="block font-mono text-xs truncate">
                            {test.id}
                          </span>
                          <span
                            className={`block text-xs mt-0.5 ${
                              isSelected
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {test.requirementId} &middot; {completedSteps}/
                            {ts.steps.length}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main panel */}
      <main className="flex-1 overflow-y-auto">
        {selectedTest && state ? (
          <TestPanel
            test={selectedTest}
            state={state}
            onUpdate={(updater) => updateState(selectedTest.id, updater)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Waehlen Sie einen Test aus der Seitenleiste.
          </div>
        )}
      </main>
    </div>
  )
}

// -------------------------------------------------------------------

interface TestPanelProps {
  test: ManualTest
  state: TestState
  onUpdate: (updater: (prev: TestState) => TestState) => void
}

function TestPanel({ test, state, onUpdate }: TestPanelProps) {
  const completedSteps = state.steps.filter((s) => s.status !== 'open').length
  const totalSteps = state.steps.length
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  const allStepsDone = completedSteps === totalSteps && totalSteps > 0
  const currentStep = state.steps[state.currentStep] ?? null

  const setStepStatus = (index: number, status: StepStatus) => {
    onUpdate((prev) => {
      const steps = prev.steps.map((s, i) =>
        i === index ? { ...s, status } : s
      )
      return { ...prev, steps }
    })
  }

  const setStepObservation = (index: number, observation: string) => {
    onUpdate((prev) => {
      const steps = prev.steps.map((s, i) =>
        i === index ? { ...s, observation } : s
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
    const md = generateResultMarkdown(test, state)
    const filename = `TEST-RESULT-${test.id}-${state.testDate}.md`
    downloadFile(filename, md)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold font-mono">{test.id}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline">{test.requirementId}</Badge>
          <Badge variant="secondary">{test.serviceFunctionId}</Badge>
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

      {/* Preparations */}
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
            test.preparations.map((prep, i) => (
              <label
                key={i}
                className="flex items-start gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={state.preparations[i]}
                  onCheckedChange={(checked) =>
                    setPreparation(i, checked === true)
                  }
                  aria-label={`Vorbereitung: ${prep}`}
                  className="mt-0.5"
                />
                <span
                  className={`text-sm ${
                    state.preparations[i]
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

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Fortschritt</span>
          <span className="text-muted-foreground">
            {completedSteps} von {totalSteps} Schritten
          </span>
        </div>
        <Progress value={progressPercent} aria-label="Testfortschritt" />
      </div>

      {/* Step overview mini-bar */}
      <div className="flex gap-1" role="group" aria-label="Schritte">
        {state.steps.map((step, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={`h-8 flex-1 rounded text-xs font-medium transition-colors border ${
              i === state.currentStep
                ? 'ring-2 ring-primary ring-offset-1'
                : ''
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

      {/* Current step detail */}
      {currentStep && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Schritt {currentStep.number} von {totalSteps}
              </CardTitle>
              <span className={`text-sm font-medium ${statusColor(currentStep.status)}`}>
                {statusIcon(currentStep.status)}{' '}
                {statusLabel(currentStep.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{currentStep.description}</p>

            {/* Status buttons */}
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

            {/* Observation */}
            <div className="space-y-1.5">
              <label
                htmlFor="step-observation"
                className="text-sm font-medium"
              >
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

            {/* Navigation */}
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

      {/* Expected result */}
      {test.expectedResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Erwartetes Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {test.expectedResult}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overall result (shown when all steps are done) */}
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

            {/* Tester name + date */}
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

            {/* Download */}
            {state.overallResult && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  {overallResultLabel(state.overallResult)}
                </p>
                <Button onClick={handleDownload} className="w-full sm:w-auto">
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
