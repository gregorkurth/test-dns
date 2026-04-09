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
import { loadObj13OperatorData, type OperatorPhase } from '@/lib/obj13-operator'

function phaseBadgeClassName(phase: OperatorPhase): string {
  if (phase === 'Applied') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (phase === 'Error') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

export default async function OperatorOverviewPage() {
  const data = await loadObj13OperatorData()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#eef4ea_50%,#ffffff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_38%),radial-gradient(circle_at_top_right,#dcfce7_0%,transparent_34%),linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-8 text-slate-50 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200">
                  OBJ-13 Kubernetes Operator
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  Lesesicht fuer Status, Baseline und Aenderungsverlauf
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Diese Seite zeigt bewusst einen transparenten Zwischenstand: das
                  Operator-Grundgeruest ist vorhanden, aber externe Git- und API-Integrationen
                  sind noch als naechster Laufzeitschritt offen.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Status</div>
                <Badge className={`mt-3 border ${phaseBadgeClassName(data.customResource.currentPhase)}`}>
                  {data.customResource.currentPhase}
                </Badge>
                <div className="mt-3 text-sm text-slate-200">
                  Aktualisiert: {formatDateTime(data.customResource.lastUpdated)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>DNSConfiguration im Ueberblick</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Resource</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {data.customResource.name}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {data.customResource.group}/{data.customResource.version} ·{' '}
                  {data.customResource.kind}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Namespace: <span className="font-medium text-slate-900">{data.customResource.namespace}</span>
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Zone: <span className="font-medium text-slate-900">{data.customResource.zoneName}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Operator-Aussage</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {data.customResource.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">Mode: {data.controllerMode}</Badge>
                  <Badge variant="outline">
                    Pflicht-Statusfelder:{' '}
                    {data.customResource.hasRequiredStatusFields ? 'vorhanden' : 'unvollstaendig'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Baseline und Rollback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Source of Truth</div>
                <p className="mt-2 text-sm font-medium text-slate-900">{data.baseline.sourceOfTruth}</p>
                <p className="mt-2 text-sm text-slate-600">{data.baseline.repository}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Revision {data.baseline.revision} · Pfad {data.baseline.path}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Rollback</div>
                <p className="mt-2 text-sm text-slate-700">{data.rollback.workflow}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {data.rollback.supported ? 'kontrolliert vorgesehen' : 'noch offen'}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {data.rollback.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Reconcile-Verhalten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Idempotenz
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {data.reconcile.idempotencyRules.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Fehlerpfad
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {data.reconcile.errorPath.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>MCP-Integrationsoption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Mode: {data.mcpIntegration.mode}</Badge>
                <Badge variant="outline">
                  {data.mcpIntegration.enabled ? 'aktiviert' : 'deaktiviert'}
                </Badge>
              </div>
              <p className="text-sm text-slate-700">
                MCP ist nur als kontrollierte Erweiterung vorgesehen. Schreibzugriffe duerfen nie
                das CRD/Reconcile-Modell umgehen.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                {data.mcpIntegration.guardrails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Noch offene Laufzeitschritte</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {data.reconcile.openRuntimeSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <section className="grid gap-4">
          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Artefakte im Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artefakt</TableHead>
                    <TableHead>Pfad</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hinweis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.manifests.map((manifest) => (
                    <TableRow key={manifest.path}>
                      <TableCell className="font-medium text-slate-900">{manifest.label}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{manifest.path}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {manifest.present ? 'vorhanden' : 'fehlt'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{manifest.summary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle>Aenderungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeitpunkt</TableHead>
                    <TableHead>Aktion</TableHead>
                    <TableHead>Revision</TableHead>
                    <TableHead>Ausgang</TableHead>
                    <TableHead>Meldung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-slate-700">
                        {formatDateTime(entry.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{entry.action}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{entry.revision}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.outcome}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{entry.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
