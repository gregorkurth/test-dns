import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { getLatestReleaseNotice } from '@/lib/obj14-release-management'

const channelLabels = {
  ga: 'Released',
  beta: 'Beta',
  rc: 'Release Candidate',
} as const

const statusLabels = {
  planned: 'Geplant',
  draft: 'Entwurf',
  'release-candidate': 'Freigabe offen',
  released: 'Verfuegbar',
} as const

const severityClasses = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-rose-200 bg-rose-50 text-rose-800',
} as const

export async function ReleaseUpdateNotice() {
  const notice = await getLatestReleaseNotice()

  if (!notice || !notice.ui.showBanner) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-slate-900 text-white">
              Update-Hinweis
            </Badge>
            <Badge variant="outline">{channelLabels[notice.channel]}</Badge>
            <Badge
              variant="outline"
              className={severityClasses[notice.severity]}
            >
              Prioritaet {notice.severity}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              {notice.version} · {statusLabels[notice.status]}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {notice.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {notice.summary}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Exportstatus</p>
          <p className="mt-1">
            {notice.documentation.exportStatus === 'completed'
              ? 'Confluence-Kopie ist protokolliert.'
              : 'Confluence-Kopie ist noch offen und bleibt im Export-Log sichtbar.'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">Was aendert sich?</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
            {notice.changes.slice(0, 3).map((change) => (
              <li key={change} className="rounded-lg bg-slate-50 px-3 py-2">
                {change}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Beta-Funktionen</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {notice.ui.betaFeatures.length > 0 ? (
              notice.ui.betaFeatures.map((feature) => (
                <Badge key={feature} variant="outline">
                  {feature}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-500">Keine Beta-Features markiert.</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/api/v1/releases?version=${encodeURIComponent(notice.version)}`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              {notice.ui.callToActionLabel}
            </Link>
            <Link
              href="/api/v1/releases"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
            >
              Alle Release-Hinweise
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
