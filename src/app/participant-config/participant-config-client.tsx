'use client'

import { startTransition, useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  buildParticipantUpsertPayload,
  coerceParticipantFormValues,
  createDefaultParticipantFormValues,
  createDraftEnvelope,
  participantFormSchema,
  participantFormValuesFromRecord,
  type Obj3ParticipantRecord,
  type ParticipantDraftEnvelope,
  type ParticipantFormValues,
} from '@/lib/obj5-participant-config'

const DRAFT_STORAGE_KEY = 'obj5.participant-form.draft.v1'
const EMPTY_SELECT_VALUE = '__none'

interface ApiErrorShape {
  message?: string
}

interface ApiEnvelope<TData> {
  data: TData | null
  error: ApiErrorShape | null
}

interface ParticipantListEntry {
  id: string
  name: string
}

type SyncState = 'idle' | 'saving' | 'saved' | 'error'

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function readDraftFromStorage(): ParticipantDraftEnvelope | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw) as Partial<ParticipantDraftEnvelope> | null
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const participantId =
    typeof parsed.participantId === 'string' && parsed.participantId.trim()
      ? parsed.participantId
      : null
  const savedAt =
    typeof parsed.savedAt === 'string' && parsed.savedAt.trim().length > 0
      ? parsed.savedAt
      : new Date().toISOString()

  return {
    participantId,
    savedAt,
    values: coerceParticipantFormValues(parsed.values),
  }
}

function writeDraftToStorage(envelope: ParticipantDraftEnvelope): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(envelope))
}

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
        message: `Unerwartete Antwort vom Server (HTTP ${response.status}).`,
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
          : 'Unbekannter Netzwerkfehler bei der API-Anfrage.',
    }
  }
}

export function ParticipantConfigClient() {
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: createDefaultParticipantFormValues(),
    mode: 'onBlur',
  })

  const {
    control,
    formState,
    handleSubmit,
    register,
    reset,
    setValue,
  } = form

  const forwardZones = useFieldArray({
    control,
    name: 'forwardZones',
  })
  const reverseZones = useFieldArray({
    control,
    name: 'reverseZones',
  })
  const nameservers = useFieldArray({
    control,
    name: 'nameservers',
  })
  const resolvers = useFieldArray({
    control,
    name: 'resolvers',
  })

  const watchedValues = useWatch({ control })
  const anycastEnabled = useWatch({ control, name: 'anycastEnabled' })
  const spiralVersion = useWatch({ control, name: 'spiralVersion' })

  const [participants, setParticipants] = useState<ParticipantListEntry[]>([])
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(
    null,
  )
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [loadingParticipant, setLoadingParticipant] = useState(false)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [hasDraft, setHasDraft] = useState(false)
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null)
  const [draftSyncReady, setDraftSyncReady] = useState(false)

  const draftDebounceRef = useRef<number | null>(null)

  const currentStateBadge = useMemo(() => {
    if (syncState === 'saving') {
      return <Badge variant="secondary">Synchronisiert...</Badge>
    }
    if (syncState === 'saved') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Gespeichert
        </Badge>
      )
    }
    if (syncState === 'error') {
      return <Badge variant="destructive">Fehler</Badge>
    }
    return <Badge variant="outline">Entwurf</Badge>
  }, [syncState])

  async function loadParticipants(preferredId?: string): Promise<void> {
    setLoadingParticipants(true)

    const response = await apiRequest<Obj3ParticipantRecord[]>(
      '/api/v1/participants',
    )
    setLoadingParticipants(false)

    if (!response.ok) {
      setSyncState('error')
      setSyncMessage(response.message)
      return
    }

    const entries = response.data
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'de'))

    startTransition(() => {
      setParticipants(entries)
      if (preferredId) {
        setSelectedParticipantId(preferredId)
      }
    })
  }

  async function loadParticipantById(id: string): Promise<void> {
    if (!id) {
      return
    }

    setLoadingParticipant(true)
    const response = await apiRequest<Obj3ParticipantRecord>(
      `/api/v1/participants/${encodeURIComponent(id)}`,
    )
    setLoadingParticipant(false)

    if (!response.ok) {
      setSyncState('error')
      setSyncMessage(response.message)
      return
    }

    const nextValues = participantFormValuesFromRecord(response.data)
    startTransition(() => {
      reset(nextValues)
      setCurrentParticipantId(response.data.id)
      setSelectedParticipantId(response.data.id)
      setSyncState('idle')
      setSyncMessage(`Participant "${response.data.id}" geladen.`)
    })
  }

  function clearDraftFromStorage(): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    setHasDraft(false)
    setLastDraftSavedAt(null)
  }

  function startNewDraft(): void {
    if (
      formState.isDirty &&
      typeof window !== 'undefined' &&
      !window.confirm(
        'Aktuellen Entwurf verwerfen und neue Konfiguration starten?',
      )
    ) {
      return
    }

    startTransition(() => {
      reset(createDefaultParticipantFormValues())
      setCurrentParticipantId(null)
      setSelectedParticipantId('')
      setSyncState('idle')
      setSyncMessage('Neuer Entwurf gestartet.')
    })
  }

  function restoreDraft(): void {
    if (!storageAvailable) {
      return
    }

    try {
      const draft = readDraftFromStorage()
      if (!draft) {
        setSyncMessage('Kein lokaler Entwurf gefunden.')
        return
      }

      startTransition(() => {
        reset(draft.values)
        setCurrentParticipantId(draft.participantId)
        setLastDraftSavedAt(draft.savedAt)
        setHasDraft(true)
        setSyncState('idle')
        setSyncMessage('Lokaler Entwurf wiederhergestellt.')
      })
    } catch {
      setStorageAvailable(false)
      setSyncState('error')
      setSyncMessage('LocalStorage nicht verfuegbar. Entwurf konnte nicht geladen werden.')
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSyncState('saving')
    setSyncMessage('Speichere Participant-Konfiguration...')

    const payload = buildParticipantUpsertPayload(values)
    const method = currentParticipantId ? 'PUT' : 'POST'
    const path = currentParticipantId
      ? `/api/v1/participants/${encodeURIComponent(currentParticipantId)}`
      : '/api/v1/participants'

    const response = await apiRequest<Obj3ParticipantRecord>(path, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      setSyncState('error')
      setSyncMessage(response.message)
      return
    }

    const persisted = response.data
    startTransition(() => {
      reset(participantFormValuesFromRecord(persisted))
      setCurrentParticipantId(persisted.id)
      setSelectedParticipantId(persisted.id)
      setSyncState('saved')
      setSyncMessage(`Konfiguration gespeichert: ${persisted.id}`)
    })

    await loadParticipants(persisted.id)
  })

  useEffect(() => {
    loadParticipants().catch(() => {
      setSyncState('error')
      setSyncMessage('Participant-Liste konnte nicht geladen werden.')
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const draft = readDraftFromStorage()
      if (draft) {
        startTransition(() => {
          reset(draft.values)
          setCurrentParticipantId(draft.participantId)
          setHasDraft(true)
          setLastDraftSavedAt(draft.savedAt)
          setSyncMessage('Lokaler Entwurf geladen.')
        })
      }
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    } finally {
      setDraftSyncReady(true)
    }
  }, [reset])

  useEffect(() => {
    if (!draftSyncReady || !storageAvailable) {
      return
    }

    if (draftDebounceRef.current) {
      window.clearTimeout(draftDebounceRef.current)
    }

    draftDebounceRef.current = window.setTimeout(() => {
      try {
        const draft = createDraftEnvelope(
          currentParticipantId,
          coerceParticipantFormValues(watchedValues),
        )
        writeDraftToStorage(draft)
        setHasDraft(true)
        setLastDraftSavedAt(draft.savedAt)
      } catch {
        setStorageAvailable(false)
      }
    }, 500)

    return () => {
      if (draftDebounceRef.current) {
        window.clearTimeout(draftDebounceRef.current)
      }
    }
  }, [currentParticipantId, draftSyncReady, storageAvailable, watchedValues])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="border-slate-200">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-2xl">
                OBJ-5 Participant Configuration Form
              </CardTitle>
              {currentStateBadge}
            </div>
            <p className="text-sm text-slate-600">
              Erfasse DNS-Teilnehmerdaten gemaess FMN-Formlogik, validiere Pflichtfelder
              und speichere den Stand via REST API. Bei API-Problemen bleibt ein lokaler
              Entwurf erhalten.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>
                Aktuelle Participant-ID:{' '}
                <strong>{currentParticipantId ?? 'neu / noch nicht gespeichert'}</strong>
              </span>
              <span>•</span>
              <span>Letzter Entwurf: {formatDateTime(lastDraftSavedAt)}</span>
              {!storageAvailable ? (
                <>
                  <span>•</span>
                  <span className="text-red-600">
                    LocalStorage nicht verfuegbar
                  </span>
                </>
              ) : null}
            </div>
          </CardHeader>
        </Card>

        {syncMessage ? (
          <Alert
            variant={syncState === 'error' ? 'destructive' : 'default'}
            className={syncState === 'saved' ? 'border-emerald-200' : undefined}
          >
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{syncMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Laden oder neuen Entwurf starten</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="participant-select">Bestehender Participant</Label>
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
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    Keine Auswahl
                  </SelectItem>
                  {participants.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.name} ({entry.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={!selectedParticipantId || loadingParticipant}
              onClick={() => loadParticipantById(selectedParticipantId)}
            >
              {loadingParticipant ? 'Lade...' : 'Participant laden'}
            </Button>

            <Button type="button" variant="outline" onClick={startNewDraft}>
              Neuer Entwurf
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!hasDraft || !storageAvailable}
              onClick={restoreDraft}
            >
              Entwurf wiederherstellen
            </Button>
          </CardContent>
          <CardContent className="pt-0 text-xs text-slate-500">
            {loadingParticipants
              ? 'Participant-Liste wird geladen...'
              : `${participants.length} Participant-Eintraege verfuegbar`}
          </CardContent>
        </Card>

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Participant Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="participantName">Participant Name *</Label>
                <Input id="participantName" {...register('participantName')} />
                {formState.errors.participantName?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.participantName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ccNumber">CC-Number *</Label>
                <Input id="ccNumber" {...register('ccNumber')} />
                {formState.errors.ccNumber?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.ccNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocName">PoC Name *</Label>
                <Input id="pocName" {...register('pocName')} />
                {formState.errors.pocName?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.pocName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocEmail">PoC E-Mail</Label>
                <Input id="pocEmail" type="email" {...register('pocEmail')} />
                {formState.errors.pocEmail?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.pocEmail.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocPhone">PoC Telefon</Label>
                <Input id="pocPhone" {...register('pocPhone')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spiralVersion">FMN Spiral-Version *</Label>
                <Select
                  value={spiralVersion}
                  onValueChange={(value) =>
                    setValue('spiralVersion', value as 'SP4' | 'SP5', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="spiralVersion">
                    <SelectValue placeholder="Spiral-Version auswaehlen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP4">SP4</SelectItem>
                    <SelectItem value="SP5">SP5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Optionale Hinweise zur Teilnehmerkonfiguration"
                  {...register('notes')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Delegated Zones</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Forward Zones *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => forwardZones.append({ value: '' })}
                  >
                    Zone hinzufuegen
                  </Button>
                </div>
                {forwardZones.fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="core.ndp.che"
                        {...register(`forwardZones.${index}.value` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => forwardZones.remove(index)}
                        disabled={forwardZones.fields.length <= 1}
                      >
                        Entfernen
                      </Button>
                    </div>
                    {formState.errors.forwardZones?.[index]?.value?.message ? (
                      <p className="text-xs text-red-600">
                        {formState.errors.forwardZones[index]?.value?.message}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Reverse Zones</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => reverseZones.append({ value: '' })}
                  >
                    Zone hinzufuegen
                  </Button>
                </div>
                {reverseZones.fields.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Keine Reverse Zone erfasst.
                  </p>
                ) : null}
                {reverseZones.fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="0.168.192.in-addr.arpa"
                        {...register(`reverseZones.${index}.value` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => reverseZones.remove(index)}
                      >
                        Entfernen
                      </Button>
                    </div>
                    {formState.errors.reverseZones?.[index]?.value?.message ? (
                      <p className="text-xs text-red-600">
                        {formState.errors.reverseZones[index]?.value?.message}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
            {formState.errors.forwardZones?.message ? (
              <CardContent className="pt-0">
                <p className="text-xs text-red-600">
                  {String(formState.errors.forwardZones.message)}
                </p>
              </CardContent>
            ) : null}
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Nameserver (mindestens 2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nameservers.fields.map((field, index) => (
                <div key={field.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Nameserver {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={nameservers.fields.length <= 2}
                      onClick={() => nameservers.remove(index)}
                    >
                      Entfernen
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>FQDN *</Label>
                      <Input
                        placeholder="ns1.core.ndp.che"
                        {...register(`nameservers.${index}.fqdn` as const)}
                      />
                      {formState.errors.nameservers?.[index]?.fqdn?.message ? (
                        <p className="text-xs text-red-600">
                          {formState.errors.nameservers[index]?.fqdn?.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label>IPv4 *</Label>
                      <Input
                        placeholder="10.0.0.11"
                        {...register(`nameservers.${index}.ipv4` as const)}
                      />
                      {formState.errors.nameservers?.[index]?.ipv4?.message ? (
                        <p className="text-xs text-red-600">
                          {formState.errors.nameservers[index]?.ipv4?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nameservers.append({ fqdn: '', ipv4: '' })}
                >
                  Nameserver hinzufuegen
                </Button>
                {formState.errors.nameservers?.message ? (
                  <p className="text-xs text-red-600">
                    {String(formState.errors.nameservers.message)}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Resolver (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resolvers.fields.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Noch keine Resolver erfasst.
                </p>
              ) : null}
              {resolvers.fields.map((field, index) => (
                <div key={field.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Resolver {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => resolvers.remove(index)}
                    >
                      Entfernen
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>FQDN *</Label>
                      <Input
                        placeholder="resolver1.core.ndp.che"
                        {...register(`resolvers.${index}.fqdn` as const)}
                      />
                      {formState.errors.resolvers?.[index]?.fqdn?.message ? (
                        <p className="text-xs text-red-600">
                          {formState.errors.resolvers[index]?.fqdn?.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label>IPv4 *</Label>
                      <Input
                        placeholder="10.0.0.21"
                        {...register(`resolvers.${index}.ipv4` as const)}
                      />
                      {formState.errors.resolvers?.[index]?.ipv4?.message ? (
                        <p className="text-xs text-red-600">
                          {formState.errors.resolvers[index]?.ipv4?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => resolvers.append({ fqdn: '', ipv4: '' })}
              >
                Resolver hinzufuegen
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Anycast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Anycast aktivieren</p>
                  <p className="text-xs text-slate-500">
                    Bei aktivem Anycast sind FQDN und IPv4 Pflicht.
                  </p>
                </div>
                <Switch
                  checked={Boolean(anycastEnabled)}
                  onCheckedChange={(checked) =>
                    setValue('anycastEnabled', checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              {anycastEnabled ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="anycastFqdn">Anycast FQDN *</Label>
                    <Input
                      id="anycastFqdn"
                      placeholder="ns-anycast.core.ndp.che"
                      {...register('anycastFqdn')}
                    />
                    {formState.errors.anycastFqdn?.message ? (
                      <p className="text-xs text-red-600">
                        {formState.errors.anycastFqdn.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="anycastIpv4">Anycast IPv4 *</Label>
                    <Input
                      id="anycastIpv4"
                      placeholder="10.0.0.53"
                      {...register('anycastIpv4')}
                    />
                    {formState.errors.anycastIpv4?.message ? (
                      <p className="text-xs text-red-600">
                        {formState.errors.anycastIpv4.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={syncState === 'saving'}>
              {syncState === 'saving'
                ? 'Speichern...'
                : currentParticipantId
                  ? 'Konfiguration aktualisieren'
                  : 'Konfiguration speichern'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (
                  typeof window !== 'undefined' &&
                  !window.confirm(
                    'Formular und lokalen Entwurf wirklich zuruecksetzen?',
                  )
                ) {
                  return
                }

                startTransition(() => {
                  reset(createDefaultParticipantFormValues())
                  setCurrentParticipantId(null)
                  setSelectedParticipantId('')
                  setSyncState('idle')
                  setSyncMessage('Formular zurueckgesetzt.')
                })
                clearDraftFromStorage()
              }}
            >
              Konfiguration zuruecksetzen
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
