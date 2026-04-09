'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createDraftEnvelope,
  coerceParticipantFormValues,
  OBJ5_DRAFT_STORAGE_KEY,
  type Obj3ParticipantRecord,
} from '@/lib/obj5-participant-config'
import {
  OBJ8_EXPORT_MANIFEST_FILE_NAME,
  buildObj8ArchiveEntries,
  buildZipArchive,
  createObj8ExportDraftFromImport,
  createObj8ExportDraftFromParticipant,
  type Obj8DownloadFile,
  type Obj8ExportDraft,
} from '@/lib/obj8-export'

interface ApiErrorShape {
  message?: string
}

interface ApiEnvelope<TData> {
  data: TData | null
  error: ApiErrorShape | null
}

interface DownloadFallback {
  fileName: string
  url: string
}

const EMPTY_SELECT_VALUE = '__none'

async function apiRequest<TData>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: TData } | { ok: false; message: string }> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        message: `Unerwartete Server-Antwort (HTTP ${response.status}).`,
      }
    }

    const body = (await response.json()) as ApiEnvelope<TData>
    if (!response.ok || body.error || body.data === null) {
      return {
        ok: false,
        message:
          body.error?.message?.trim() ||
          `Anfrage fehlgeschlagen (HTTP ${response.status}).`,
      }
    }

    return { ok: true, data: body.data }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unbekannter Netzwerkfehler.',
    }
  }
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function draftSourceLabel(draft: Obj8ExportDraft): string {
  return draft.source === 'api' ? 'API' : 'JSON-Import'
}

function fileKindLabel(file: Obj8DownloadFile): string {
  switch (file.kind) {
    case 'forward-zone':
      return 'Forward Zone'
    case 'reverse-zone':
      return 'Reverse Zone'
    case 'named-conf-snippet':
      return 'named.conf.local.snippet'
    case 'tsig-keygen-script':
      return 'tsig-keygen.sh'
    case 'json-export':
      return 'JSON Export'
    case 'manifest':
      return 'Manifest'
  }
}

export function ExportDownloadClient() {
  const [participants, setParticipants] = useState<Obj3ParticipantRecord[]>([])
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<Obj3ParticipantRecord | null>(
    null,
  )
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [loadingParticipant, setLoadingParticipant] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isPreparingZip, setIsPreparingZip] = useState(false)
  const [downloadFallback, setDownloadFallback] = useState<DownloadFallback | null>(null)
  const [importedDraft, setImportedDraft] = useState<Obj8ExportDraft | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fallbackUrlRef = useRef<string | null>(null)

  const selectedDraft = useMemo(() => {
    if (!selectedParticipant) {
      return null
    }
    return createObj8ExportDraftFromParticipant(selectedParticipant)
  }, [selectedParticipant])

  const activeDraft = importedDraft ?? selectedDraft
  const readyToExport = Boolean(activeDraft?.ready)
  const sourceBadgeLabel = activeDraft ? draftSourceLabel(activeDraft) : 'API'

  const loadParticipants = useCallback(async (): Promise<void> => {
    setLoadingParticipants(true)
    const response = await apiRequest<Obj3ParticipantRecord[]>('/api/v1/participants')
    setLoadingParticipants(false)

    if (!response.ok) {
      setErrorMessage(response.message)
      return
    }

    const sorted = response.data.slice().sort((left, right) =>
      left.name.localeCompare(right.name, 'de'),
    )

    startTransition(() => {
      setParticipants(sorted)
      setSelectedParticipantId((current) => current || sorted[0]?.id || '')
    })
  }, [])

  const loadParticipant = useCallback(async (participantId: string): Promise<void> => {
    if (!participantId) {
      setSelectedParticipant(null)
      return
    }

    setSelectedParticipant(null)
    setLoadingParticipant(true)
    const response = await apiRequest<Obj3ParticipantRecord>(
      `/api/v1/participants/${encodeURIComponent(participantId)}`,
    )
    setLoadingParticipant(false)

    if (!response.ok) {
      setSelectedParticipant(null)
      setErrorMessage(response.message)
      return
    }

    startTransition(() => {
      setSelectedParticipant(response.data)
    })
  }, [])

  useEffect(() => {
    loadParticipants().catch(() => {
      setErrorMessage('Participant-Liste konnte nicht geladen werden.')
    })
  }, [loadParticipants])

  useEffect(() => {
    loadParticipant(selectedParticipantId).catch(() => {
      setSelectedParticipant(null)
      setErrorMessage('Participant-Details konnten nicht geladen werden.')
    })
  }, [loadParticipant, selectedParticipantId])

  useEffect(
    () => () => {
      if (fallbackUrlRef.current) {
        URL.revokeObjectURL(fallbackUrlRef.current)
        fallbackUrlRef.current = null
      }
    },
    [],
  )

  function createDownloadLink(blob: Blob, fileName: string): string {
    const nextUrl = URL.createObjectURL(blob)
    if (fallbackUrlRef.current) {
      URL.revokeObjectURL(fallbackUrlRef.current)
    }
    fallbackUrlRef.current = nextUrl
    setDownloadFallback({
      fileName,
      url: nextUrl,
    })
    return nextUrl
  }

  function triggerDownload(blob: Blob, fileName: string): void {
    const url = createDownloadLink(blob, fileName)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  function persistImportedDraftForObj5(draft: Obj8ExportDraft): void {
    if (typeof window === 'undefined') {
      return
    }

    const envelope = createDraftEnvelope(
      draft.participant.id,
      coerceParticipantFormValues(draft.configuration),
    )
    window.localStorage.setItem(OBJ5_DRAFT_STORAGE_KEY, JSON.stringify(envelope))
  }

  async function handleImportJson(file: File): Promise<void> {
    setLoadingImport(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const raw = await file.text()
      const imported = createObj8ExportDraftFromImport(JSON.parse(raw))
      persistImportedDraftForObj5(imported)
      setImportedDraft(imported)
      setSuccessMessage(
        `JSON-Import erfolgreich: ${imported.participant.ccNumber} ist aktiv und fuer OBJ-5 vorgemerkt.`,
      )
    } catch (error) {
      setImportedDraft(null)
      setErrorMessage(
        error instanceof Error ? error.message : 'JSON-Import fehlgeschlagen.',
      )
    } finally {
      setLoadingImport(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleDownloadFile(file: Obj8DownloadFile): void {
    const blob = new Blob([file.content], { type: file.mimeType })
    triggerDownload(blob, file.fileName)
    setSuccessMessage(
      `${file.fileName} wurde angestossen. Falls blockiert, nutze den manuellen Download-Link unten.`,
    )
  }

  function handleDownloadZip(): void {
    if (!activeDraft || !activeDraft.ready || isPreparingZip) {
      return
    }

    setIsPreparingZip(true)
    setErrorMessage('')
    setSuccessMessage('ZIP wird vorbereitet...')

    window.setTimeout(() => {
      try {
        const archiveEntries = buildObj8ArchiveEntries(activeDraft)
        const archiveBytes = buildZipArchive(archiveEntries)
        const normalized = archiveBytes.buffer.slice(
          archiveBytes.byteOffset,
          archiveBytes.byteOffset + archiveBytes.byteLength,
        ) as ArrayBuffer
        const blob = new Blob([normalized], { type: 'application/zip' })
        triggerDownload(blob, activeDraft.zipFileName)
        setSuccessMessage(
          `${activeDraft.zipFileName} wurde lokal erzeugt. Falls blockiert, nutze den manuellen Download-Link unten.`,
        )
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'ZIP-Export fehlgeschlagen.',
        )
      } finally {
        setIsPreparingZip(false)
      }
    }, 0)
  }

  function clearImportedDraft(): void {
    setImportedDraft(null)
    setSuccessMessage('Importierte Konfiguration wurde entfernt.')
  }

  const validationIssues = activeDraft?.validationIssues ?? []
  const warnings = activeDraft?.warnings ?? []
  const exportFiles = activeDraft?.files ?? []
  const forwardFile = exportFiles.find((file) => file.kind === 'forward-zone') ?? null
  const reverseFiles = exportFiles.filter((file) => file.kind === 'reverse-zone')
  const namedConfFile = exportFiles.find((file) => file.kind === 'named-conf-snippet') ?? null
  const tsigFile = exportFiles.find((file) => file.kind === 'tsig-keygen-script') ?? null
  const jsonFile = exportFiles.find((file) => file.kind === 'json-export') ?? null

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">OBJ-8 Export & Download</CardTitle>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  Offline-faehige Lesesicht und Download-Zentrale fuer DNS-Artefakte.
                  Der ZIP-Export wird lokal im Browser gebaut, ohne externe Lib und ohne
                  Cloud-Abhaengigkeit.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Offline</Badge>
                <Badge variant={readyToExport ? 'default' : 'destructive'}>
                  {readyToExport ? 'Exportbereit' : 'Blockiert'}
                </Badge>
                {isPreparingZip ? <Badge variant="secondary">ZIP wird gebaut...</Badge> : null}
                <Badge variant="outline">{sourceBadgeLabel}</Badge>
              </div>
            </div>
            {activeDraft ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Participant</div>
                  <div className="mt-1 font-medium">{activeDraft.participant.name}</div>
                  <div className="text-sm text-slate-600">{activeDraft.participant.id}</div>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">CC-Number</div>
                  <div className="mt-1 font-medium">{activeDraft.participant.ccNumber}</div>
                  <div className="text-sm text-slate-600">{activeDraft.zipFileName}</div>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Aktualisiert</div>
                  <div className="mt-1 font-medium">
                    {formatDateTime(activeDraft.manifest.exportedAt)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {activeDraft.manifest.files.length} Dateien im Paket
                  </div>
                </div>
              </div>
            ) : null}
          </CardHeader>
        </Card>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert>
            <AlertTitle>Hinweis</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {downloadFallback ? (
          <Alert>
            <AlertTitle>Fallback bei Download-Blockade</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Wenn der Browser den Download blockiert, kannst du diese Datei manuell laden:
              </p>
              <a
                href={downloadFallback.url}
                download={downloadFallback.fileName}
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                {downloadFallback.fileName} manuell herunterladen
              </a>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>1. Participant aus API waehlen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="participant-select">Participant</Label>
                <Select
                  value={selectedParticipantId || EMPTY_SELECT_VALUE}
                  onValueChange={(value) => {
                    setImportedDraft(null)
                    setErrorMessage('')
                    setSuccessMessage('')
                    setSelectedParticipant(null)
                    setSelectedParticipantId(value === EMPTY_SELECT_VALUE ? '' : value)
                  }}
                  disabled={loadingParticipants}
                >
                  <SelectTrigger id="participant-select">
                    <SelectValue placeholder="Participant auswaehlen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT_VALUE}>Bitte waehlen</SelectItem>
                    {participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name} ({participant.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {loadingParticipants
                    ? 'Teilnehmerliste wird geladen...'
                    : `${participants.length} Participants verfuegbar`}
                </p>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Aktuelle Validierung</div>
                    <div className="text-xs text-slate-500">
                      Aktionen bleiben gesperrt, bis die Konfiguration vollstaendig ist.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingParticipant ? <Badge variant="secondary">Pruefe...</Badge> : null}
                    <Badge variant={readyToExport ? 'default' : 'destructive'}>
                      {readyToExport ? 'OK' : 'Unvollstaendig'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {validationIssues.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertTitle>Konfiguration gesperrt</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5">
                          {validationIssues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertTitle>Bereit</AlertTitle>
                      <AlertDescription>
                        Die Konfiguration ist exportbereit. Einzel-Downloads, JSON und ZIP
                        koennen erzeugt werden.
                      </AlertDescription>
                    </Alert>
                  )}

                  {warnings.length > 0 ? (
                    <Alert>
                      <AlertTitle>Hinweise</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5">
                          {warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>2. JSON Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="obj8-json-import">JSON-Datei</Label>
                <Input
                  ref={fileInputRef}
                  id="obj8-json-import"
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    if (!file) {
                      return
                    }
                    void handleImportJson(file)
                  }}
                  disabled={loadingImport}
                />
                <p className="text-xs text-slate-500">
                  Erwartet wird ein JSON mit Schema-Pruefung, Pflichtfeldern und
                  CC-Number-Abgleich.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loadingImport}
                  >
                    {loadingImport ? 'Importiere...' : 'JSON waehlen'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearImportedDraft}
                    disabled={!importedDraft}
                  >
                    Import verwerfen
                  </Button>
                </div>
                {importedDraft ? (
                  <Alert>
                    <AlertTitle>Import aktiv</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                      {importedDraft.participant.ccNumber} wurde geladen. Der Import
                      ueberschreibt den aktiven Participant, bis er verworfen wird.
                      </p>
                      <a
                        href="/participant-config"
                        className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Zu OBJ-5 wechseln und Werte uebernehmen
                      </a>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTitle>Kein Import aktiv</AlertTitle>
                    <AlertDescription>
                      Die API-Auswahl ist weiterhin die aktive Quelle.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>3. Downloads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => forwardFile && handleDownloadFile(forwardFile)}
                disabled={!readyToExport || !forwardFile || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                Forward Zone
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!readyToExport) {
                    return
                  }
                  reverseFiles.forEach((file) => handleDownloadFile(file))
                }}
                disabled={!readyToExport || reverseFiles.length === 0 || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                Reverse Zone(s)
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => namedConfFile && handleDownloadFile(namedConfFile)}
                disabled={!readyToExport || !namedConfFile || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                named.conf.local.snippet
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => tsigFile && handleDownloadFile(tsigFile)}
                disabled={!readyToExport || !tsigFile || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                tsig-keygen.sh
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => jsonFile && handleDownloadFile(jsonFile)}
                disabled={!readyToExport || !jsonFile || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                JSON Export
              </Button>
              <Button
                type="button"
                onClick={handleDownloadZip}
                disabled={!readyToExport || isPreparingZip}
                title={
                  !readyToExport
                    ? 'Bitte zuerst alle Pflichtfelder ausfuellen'
                    : undefined
                }
              >
                {isPreparingZip ? 'ZIP wird erstellt...' : 'Alles herunterladen als ZIP'}
              </Button>
            </div>

            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Paket-Inhalt</div>
                  <div className="text-xs text-slate-500">
                    {OBJ8_EXPORT_MANIFEST_FILE_NAME} liegt im ZIP mit Zeitstempel und
                    Dateiliste bei. Der ZIP-Export laeuft lokal im Browser.
                  </div>
                </div>
                <Badge variant="secondary">{exportFiles.length} Dateien</Badge>
              </div>

              {exportFiles.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {exportFiles.map((file) => (
                    <li
                      key={file.fileName}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white px-3 py-2"
                    >
                      <div>
                        <div className="font-medium">{file.fileName}</div>
                        <div className="text-xs text-slate-500">
                          {fileKindLabel(file)} · {formatDateTime(file.generatedAt)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDownloadFile(file)}
                      >
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 text-sm text-slate-500">
                  Noch keine exportierbaren Dateien vorhanden.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
