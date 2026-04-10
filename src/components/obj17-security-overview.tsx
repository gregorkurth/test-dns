import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  Obj17SecurityBundle,
  Obj17SecuritySummary,
} from '@/lib/obj17-security-scanning'

function gateBadgeClassName(value: Obj17SecuritySummary['gateStatus']): string {
  if (value === 'pass') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'accepted-risk') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (value === 'fail') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function scanBadgeClassName(value: 'passed' | 'failed' | 'unknown'): string {
  if (value === 'passed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'failed') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function totalFailedScans(bundle: Obj17SecurityBundle): number {
  return [
    bundle.scans.sast.status,
    bundle.scans.sca.status,
    bundle.scans.container.status,
    bundle.scans.config.status,
  ].filter((status) => status === 'failed').length
}

export function Obj17SecurityOverview({
  sourceOfTruth,
  updatedAt,
  summary,
  bundles,
}: {
  sourceOfTruth: string
  updatedAt: string
  summary: Obj17SecuritySummary
  bundles: Obj17SecurityBundle[]
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">OBJ-17</p>
          <h1 className="mt-1 text-2xl font-semibold">SBOM & Security Scanning</h1>
          <p className="mt-2 text-sm text-slate-600">
            Einheitliche Sicherheitsnachweise pro Version: SBOM, Scanstatus,
            Findings und Gate-Entscheid.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Source of truth: {sourceOfTruth} · Aktualisiert: {formatDate(updatedAt)}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Latest Version</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">
                {summary.latestVersion ?? 'n/a'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Gate</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={gateBadgeClassName(summary.gateStatus)}>
                {summary.gateStatus}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">
                {summary.openCriticalFindings}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">High</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">
                {summary.openHighFindings}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Offline Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className={summary.offlineSnapshotAvailable ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}
              >
                {summary.offlineSnapshotAvailable ? 'available' : 'missing'}
              </Badge>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Security Bundles</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>SBOM</TableHead>
                <TableHead>Scan Summary</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Gate</TableHead>
                <TableHead>Offline DB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((bundle) => (
                <TableRow key={bundle.version}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{bundle.version}</p>
                    <p className="text-xs text-slate-500">{formatDate(bundle.generatedAt)}</p>
                  </TableCell>
                  <TableCell>{bundle.channel}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <Badge
                        variant="outline"
                        className={bundle.sbom.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}
                      >
                        {bundle.sbom.available ? 'available' : 'missing'}
                      </Badge>
                      <p className="text-xs text-slate-500">{bundle.sbom.format}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={scanBadgeClassName(bundle.scans.sast.status)}>
                        SAST
                      </Badge>
                      <Badge variant="outline" className={scanBadgeClassName(bundle.scans.sca.status)}>
                        SCA
                      </Badge>
                      <Badge
                        variant="outline"
                        className={scanBadgeClassName(bundle.scans.container.status)}
                      >
                        Image
                      </Badge>
                      <Badge
                        variant="outline"
                        className={scanBadgeClassName(bundle.scans.config.status)}
                      >
                        Config
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Failed scans: {totalFailedScans(bundle)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700">
                      Critical {bundle.findings.criticalOpen}
                    </p>
                    <p className="text-sm text-slate-700">High {bundle.findings.highOpen}</p>
                    <p className="text-xs text-slate-500">
                      Accepted risk high: {bundle.findings.highAcceptedRisk}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={gateBadgeClassName(bundle.gate.status)}>
                      {bundle.gate.status}
                    </Badge>
                    <p className="mt-1 text-xs text-slate-500">{bundle.gate.owner}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-600">{bundle.gate.dbSnapshotVersion}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(bundle.gate.dbSnapshotUpdatedAt)}
                    </p>
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
