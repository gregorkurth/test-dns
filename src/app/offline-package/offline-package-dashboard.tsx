'use client'

import { startTransition, useDeferredValue, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  Obj19OfflinePackageRecord,
  Obj19OfflinePackageSummary,
  Obj19PackageVariant,
} from '@/lib/obj19-offline-package'

const allFilterValue = 'ALL'

function variantBadgeClassName(variant: Obj19PackageVariant): string {
  if (variant === 'full') {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function booleanBadgeClassName(value: boolean): string {
  if (value) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function formatBytes(value: number): string {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(0)} MB`
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(0)} KB`
  }

  return `${value} B`
}

function filterPackages(
  packages: Obj19OfflinePackageRecord[],
  query: string,
  variant: Obj19PackageVariant | null,
): Obj19OfflinePackageRecord[] {
  const normalizedQuery = query.trim().toLowerCase()

  return packages.filter((entry) => {
    if (variant && entry.variant !== variant) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    return (
      entry.version.toLowerCase().includes(normalizedQuery) ||
      entry.targetEnvironment.toLowerCase().includes(normalizedQuery) ||
      entry.ownerRole.toLowerCase().includes(normalizedQuery) ||
      entry.releaseProject.repository.toLowerCase().includes(normalizedQuery) ||
      entry.configurationProject.repository.toLowerCase().includes(normalizedQuery)
    )
  })
}

export function OfflinePackageDashboard({
  sourceOfTruth,
  updatedAt,
  summary,
  packages,
}: {
  sourceOfTruth: string
  updatedAt: string
  summary: Obj19OfflinePackageSummary
  packages: Obj19OfflinePackageRecord[]
}) {
  const [query, setQuery] = useState('')
  const [variantFilter, setVariantFilter] = useState<Obj19PackageVariant | null>(null)
  const deferredQuery = useDeferredValue(query)
  const filteredPackages = filterPackages(packages, deferredQuery, variantFilter)

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">OBJ-19</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Offline Package Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Sicht auf Zarf-Pakete, Varianten, Integritaetsnachweise und
                Uebergabeinformationen fuer den Offline-Transfer.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p>Source of truth: {sourceOfTruth}</p>
              <p>Aktualisiert: {formatDateTime(updatedAt)}</p>
              <p>API: /api/v1/offline-package</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Latest Version</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{summary.latestVersion ?? 'n/a'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Package Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {summary.variantsAvailable.map((variant) => (
                <Badge
                  key={variant}
                  variant="outline"
                  className={variantBadgeClassName(variant)}
                >
                  {variant}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Import Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">
                {summary.importReadyPackages}/{summary.totalPackages}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Release Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">
                {summary.releaseAssignedPackages}/{summary.totalPackages}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Offline DB Bundles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{summary.packagesWithOfflineDb}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value
                  startTransition(() => {
                    setQuery(nextValue)
                  })
                }}
                placeholder="Version, Zielumgebung oder Repository suchen"
              />
              <Select
                value={variantFilter ?? allFilterValue}
                onValueChange={(value) => {
                  startTransition(() => {
                    setVariantFilter(
                      value === allFilterValue ? null : (value as Obj19PackageVariant),
                    )
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Variante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allFilterValue}>Alle Varianten</SelectItem>
                  <SelectItem value="minimal">minimal</SelectItem>
                  <SelectItem value="full">full</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Target Environments</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {summary.targetEnvironments.map((environment) => (
                <Badge key={environment} variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {environment}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Package Catalogue</h2>
              <p className="text-sm text-slate-600">
                {filteredPackages.length} von {packages.length} Paketen sichtbar
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Integrity</TableHead>
                <TableHead>Handover</TableHead>
                <TableHead>Source Mapping</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((entry) => (
                <TableRow key={`${entry.version}-${entry.variant}`}>
                  <TableCell className="align-top">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{entry.version}</p>
                        <Badge
                          variant="outline"
                          className={variantBadgeClassName(entry.variant)}
                        >
                          {entry.variant}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={booleanBadgeClassName(entry.importReady)}
                        >
                          {entry.importReady ? 'import-ready' : 'pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{entry.packageFile}</p>
                      <p className="text-sm text-slate-600">
                        {entry.targetEnvironment} · {formatBytes(entry.packageSizeBytes)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Erstellt: {formatDateTime(entry.createdAt)} · Rolle: {entry.ownerRole}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>Images: {entry.manifest.images.length}</p>
                      <p>Assets: {entry.manifest.deploymentAssets.length}</p>
                      <Badge
                        variant="outline"
                        className={booleanBadgeClassName(entry.security.offlineDbIncluded)}
                      >
                        {entry.security.offlineDbIncluded ? 'offline-db included' : 'offline-db external'}
                      </Badge>
                      <ul className="space-y-1 text-xs text-slate-500">
                        {entry.manifest.deploymentAssets.slice(0, 3).map((asset) => (
                          <li key={`${entry.version}-${entry.variant}-${asset.path}`}>
                            {asset.type}: {asset.path}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>Checksums: {entry.checksums.length}</p>
                      <p>Manifest: {entry.manifestFile}</p>
                      <p className="text-xs text-slate-500">
                        Security bundle: {entry.security.bundleVersion}
                      </p>
                      {entry.security.offlineDbPath ? (
                        <p className="text-xs text-slate-500">
                          Offline DB: {entry.security.offlineDbPath}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>{entry.handover.id}</p>
                      <p className="text-xs text-slate-500">
                        {entry.handover.createdByRole} {'->'} {entry.handover.recipientRole}
                      </p>
                      <Badge
                        variant="outline"
                        className={booleanBadgeClassName(
                          entry.handover.checksumVerifiedBeforeTransfer,
                        )}
                      >
                        pre-transfer checksum
                      </Badge>
                      <Badge
                        variant="outline"
                        className={booleanBadgeClassName(
                          entry.handover.checksumVerifiedAfterTransfer,
                        )}
                      >
                        post-transfer checksum
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>Release: {entry.releaseProject.repository}</p>
                      <p>Revision: {entry.releaseProject.revision}</p>
                      <p>Config: {entry.configurationProject.repository}</p>
                      <p>Config revision: {entry.configurationProject.revision}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  )
}
