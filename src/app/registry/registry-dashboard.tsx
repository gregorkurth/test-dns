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
import {
  getObj18ArtifactBadgeLabel,
  getObj18GateTone,
  type Obj18RegistryData,
  type Obj18RegistryRecord,
} from '@/lib/obj18-artifact-registry'

function formatDate(value: string | null): string {
  if (!value) {
    return 'n/a'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function gateClassName(record: Obj18RegistryRecord): string {
  const tone = getObj18GateTone(record)
  if (tone === 'good') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (tone === 'risk') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function typeClassName(record: Obj18RegistryRecord): string {
  if (record.artifactType === 'oci-image' || record.artifactType === 'security-bundle') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }
  if (record.artifactType === 'documentation-bundle') {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }
  if (record.artifactType === 'sbom' || record.artifactType === 'scan-report') {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function metadataClassName(completeness: Obj18RegistryRecord['metadata']['completeness']): string {
  if (completeness === 'complete') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (completeness === 'derived') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

export function Obj18RegistryDashboard({
  data,
}: {
  data: Obj18RegistryData
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.08),_transparent_42%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">OBJ-18</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Artefakt-Registry
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Zentrale Lesesicht fuer Publish-Status, Security-Gate, OCI-Nachweis und
            Offline-Relevanz aller Release-Artefakte. Git bleibt die Primaerquelle,
            die Registry-Sicht macht die Lieferkette fuer Nicht-Entwickler lesbar.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
            {data.summary.sourceOfTruth.map((entry) => (
              <Badge key={entry} variant="outline" className="border-slate-300 bg-slate-50">
                {entry}
              </Badge>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Primary Registry</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-slate-950">
              {data.summary.primaryRegistry}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Published</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-emerald-700">
              {data.summary.publishedArtifacts}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Pending / Blocked</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-amber-700">
              {data.summary.pendingArtifacts} / {data.summary.blockedArtifacts}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">OCI-konform</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-cyan-700">
              {data.summary.ociArtifacts}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Zarf-relevant</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-slate-950">
              {data.summary.zarfEligibleArtifacts}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Published after gate</CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold text-slate-950">
              {data.summary.publishedOnlyAfterGateArtifacts}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle>Policy Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Release-Tags sind als immutable modelliert. Rolling-Tags wie <span className="font-mono">latest</span>{' '}
                bleiben ueberschreibbar, damit main-basierte Builds weiterhin klar erkennbar sind.
              </p>
              <p>
                Publish erfolgt erst nach bestandenem Security-Gate oder dokumentierter
                Risikoakzeptanz. Zarf-relevante Artefakte werden separat markiert, damit die
                Offline-Weitergabe aus derselben Registry-Sicht planbar bleibt.
              </p>
              <p className="text-xs text-slate-500">
                Registry-Mirror ist aktuell nicht konfiguriert. Die Primaerquelle bleibt die
                interne Publish-Kette.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle>Versionen im Katalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.summary.versions.map((version) => (
                <div
                  key={version}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {version}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Registry Catalog</h2>
              <p className="text-sm text-slate-600">
                {data.summary.totalArtifacts} Artefakte, Stand {formatDate(data.summary.generatedAt)}
              </p>
            </div>
            <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
              API: /api/v1/registry
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artifact</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Registry / Reference</TableHead>
                <TableHead>Gate</TableHead>
                <TableHead>Metadata</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead>Zarf</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="align-top">
                    <div className="space-y-2">
                      <p className="font-medium text-slate-950">{record.artifactName}</p>
                      <Badge variant="outline" className={typeClassName(record)}>
                        {getObj18ArtifactBadgeLabel(record.artifactType)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <p className="font-medium text-slate-900">{record.version}</p>
                    <p className="text-xs text-slate-500">{record.channel}</p>
                    <p className="text-xs text-slate-500">
                      Published: {formatDate(record.publishedAt)}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <p className="text-sm font-medium text-slate-900">{record.primaryRegistry}</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {record.reference}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Tags: {record.tags.length > 0 ? record.tags.join(', ') : 'n/a'}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className={gateClassName(record)}>
                      {record.publishState}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-600">
                      Security: {record.gate.securityStatus}
                    </p>
                    <p className="text-xs text-slate-500">
                      Published after gate:{' '}
                      {record.gate.publishedOnlyAfterGate ? 'yes' : 'no'}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={metadataClassName(record.metadata.completeness)}
                    >
                      {record.metadata.completeness}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-600">
                      Build: {formatDate(record.metadata.buildDate)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Git SHA: {record.metadata.gitSha ?? 'not embedded in source data'}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <p className="text-sm text-slate-700">{record.retention.policyLabel}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Immutable: {record.immutable ? 'yes' : 'rolling'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Evidence local: {record.evidence.localExists ? 'yes' : 'reference only'}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={
                        record.zarf.included
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }
                    >
                      {record.zarf.included ? 'included' : 'not included'}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-500">{record.zarf.reason}</p>
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
