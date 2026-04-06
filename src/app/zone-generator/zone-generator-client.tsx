'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Obj3ParticipantRecord } from '@/lib/obj5-participant-config'
import type { ZoneGenerationResult } from '@/lib/obj3-zone-generator'
import {
  createDefaultObj6SoaSettings,
  prepareZoneGenerationInputFromParticipant,
  type Obj6SoaSettings,
  type ZoneGenerationApiPayload,
} from '@/lib/obj6-zone-generation'

interface ApiErrorShape {
  message?: string
}

interface ApiEnvelope<TData> {
  data: TData | null
  error: ApiErrorShape | null
}

const EMPTY_SELECT_VALUE = '__none'

async function apiRequest<TData>(
  path: string,
  init?: RequestInit,
): Promise<
  | { ok: true; data: TData }
  | { ok: false; message: string }
> {
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
        error instanceof Error
          ? error.message
          : 'Unbekannter Netzwerkfehler.',
    }
  }
}

function parsePositiveNumber(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

export function ZoneGeneratorClient() {
  const [participants, setParticipants] = useState<Obj3ParticipantRecord[]>([])
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState<Obj6SoaSettings>(
    createDefaultObj6SoaSettings(),
  )
  const [forwardResult, setForwardResult] = useState<ZoneGenerationResult | null>(
    null,
  )
  const [reverseResults, setReverseResults] = useState<ZoneGenerationResult[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lastGeneratedKey, setLastGeneratedKey] = useState('')

  const selectedParticipant = useMemo(
    () => participants.find((entry) => entry.id === selectedParticipantId) ?? null,
    [participants, selectedParticipantId],
  )

  const generationKey = useMemo(
    () => JSON.stringify({ selectedParticipantId, settings }),
    [selectedParticipantId, settings],
  )

  const hasPendingChanges =
    Boolean(lastGeneratedKey) && generationKey !== lastGeneratedKey

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
      setSelectedParticipantId((previousId) => previousId || sorted[0]?.id || '')
    })
  }, [])

  async function generateViaApi(
    payload: ZoneGenerationApiPayload,
  ): Promise<ZoneGenerationResult> {
    const response = await apiRequest<ZoneGenerationResult>('/api/v1/zones/generate', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(response.message)
    }
    return response.data
  }

  function updateSettingNumber(
    key: keyof Obj6SoaSettings,
    rawValue: string,
    fallback: number,
  ): void {
    setSettings((previous) => ({
      ...previous,
      [key]: parsePositiveNumber(rawValue, fallback),
    }))
  }

  async function handleGenerate(): Promise<void> {
    setErrorMessage('')
    setSuccessMessage('')
    setWarnings([])

    if (!selectedParticipantId) {
      setErrorMessage('Bitte zuerst einen Participant auswaehlen.')
      return
    }

    setIsGenerating(true)

    const detailResponse = await apiRequest<Obj3ParticipantRecord>(
      `/api/v1/participants/${encodeURIComponent(selectedParticipantId)}`,
    )
    if (!detailResponse.ok) {
      setIsGenerating(false)
      setErrorMessage(detailResponse.message)
      return
    }

    let prepared: ReturnType<typeof prepareZoneGenerationInputFromParticipant>
    try {
      prepared = prepareZoneGenerationInputFromParticipant(
        detailResponse.data,
        settings,
      )
    } catch (error) {
      setIsGenerating(false)
      setErrorMessage(
        error instanceof Error ? error.message : 'Zone-Daten konnten nicht vorbereitet werden.',
      )
      return
    }

    try {
      const nextForward = await generateViaApi(prepared.forward)
      const nextReverse: ZoneGenerationResult[] = []
      for (const reversePayload of prepared.reverse) {
        nextReverse.push(await generateViaApi(reversePayload))
      }

      startTransition(() => {
        setForwardResult(nextForward)
        setReverseResults(nextReverse)
        setWarnings(prepared.warnings)
        setSuccessMessage(
          `Zone-Files fuer ${prepared.participantName} wurden erfolgreich erzeugt.`,
        )
        setLastGeneratedKey(generationKey)
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Zone-Generierung fehlgeschlagen.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyToClipboard(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value)
      setSuccessMessage('Zone-File in die Zwischenablage kopiert.')
    } catch {
      setErrorMessage('Kopieren nicht moeglich. Bitte Inhalt manuell kopieren.')
    }
  }

  useEffect(() => {
    loadParticipants().catch(() => {
      setErrorMessage('Participant-Liste konnte nicht geladen werden.')
    })
  }, [loadParticipants])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-2xl">OBJ-6 DNS Zone File Generator</CardTitle>
              <Badge variant="outline">API-basiert</Badge>
            </div>
            <p className="text-sm text-slate-600">
              Waehle einen Participant aus OBJ-5, konfiguriere SOA-Werte und
              generiere BIND9-kompatible Forward- und Reverse-Zone-Files ueber
              die API `/api/v1/zones/generate`.
            </p>
          </CardHeader>
        </Card>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="border-emerald-200">
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

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

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Participant und SOA-Parameter</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="participant-select">Participant (aus OBJ-5)</Label>
              <Select
                value={selectedParticipantId || EMPTY_SELECT_VALUE}
                onValueChange={(value) =>
                  setSelectedParticipantId(value === EMPTY_SELECT_VALUE ? '' : value)
                }
              >
                <SelectTrigger id="participant-select">
                  <SelectValue placeholder="Participant auswaehlen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Keine Auswahl</SelectItem>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.name} ({participant.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {loadingParticipants
                  ? 'Participant-Liste wird geladen...'
                  : `${participants.length} Participants verfuegbar`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-ttl">Default TTL</Label>
              <Input
                id="default-ttl"
                type="number"
                min={1}
                value={settings.defaultTtl}
                onChange={(event) =>
                  updateSettingNumber('defaultTtl', event.target.value, 3600)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial">Serial (optional, sonst auto)</Label>
              <Input
                id="serial"
                value={settings.serial}
                placeholder="YYYYMMDDXX"
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, serial: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-ns">SOA Primary NS (optional)</Label>
              <Input
                id="primary-ns"
                value={settings.primaryNs}
                placeholder="ns1.core.ndp.che"
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    primaryNs: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-mail">SOA Admin Mail (optional)</Label>
              <Input
                id="admin-mail"
                value={settings.adminMail}
                placeholder="hostmaster.core.ndp.che"
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    adminMail: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh">SOA Refresh</Label>
              <Input
                id="refresh"
                type="number"
                min={1}
                value={settings.refresh}
                onChange={(event) =>
                  updateSettingNumber('refresh', event.target.value, 7200)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retry">SOA Retry</Label>
              <Input
                id="retry"
                type="number"
                min={1}
                value={settings.retry}
                onChange={(event) =>
                  updateSettingNumber('retry', event.target.value, 3600)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expire">SOA Expire</Label>
              <Input
                id="expire"
                type="number"
                min={1}
                value={settings.expire}
                onChange={(event) =>
                  updateSettingNumber('expire', event.target.value, 1209600)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum">SOA Minimum TTL</Label>
              <Input
                id="minimum"
                type="number"
                min={1}
                value={settings.minimum}
                onChange={(event) =>
                  updateSettingNumber('minimum', event.target.value, 3600)
                }
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generiere...' : 'Zone-Files generieren'}
              </Button>
              <Button variant="outline" onClick={() => loadParticipants()}>
                Participants neu laden
              </Button>
              {hasPendingChanges ? (
                <Badge variant="secondary">
                  Konfiguration geaendert - bitte neu generieren
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {selectedParticipant ? (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Aktueller Participant-Kontext</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <p>
                <strong>Name:</strong> {selectedParticipant.name}
              </p>
              <p>
                <strong>ID:</strong> {selectedParticipant.id}
              </p>
              <p>
                <strong>Letztes Update:</strong>{' '}
                {formatDateTime(selectedParticipant.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {forwardResult ? (
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg">
                Forward Zone: {forwardResult.fileName}
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(forwardResult.zoneFile)}
              >
                Kopieren
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                rows={18}
                value={forwardResult.zoneFile}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        ) : null}

        {reverseResults.map((result) => (
          <Card key={result.fileName} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg">Reverse Zone: {result.fileName}</CardTitle>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(result.zoneFile)}
              >
                Kopieren
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                rows={14}
                value={result.zoneFile}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
