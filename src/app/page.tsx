import Link from 'next/link'

import { Obj15UpdateHints } from '@/components/obj15-update-hints'
import { ReleaseUpdateNotice } from '@/components/release-update-notice'
import { getProductWebsiteViewModel } from '@/lib/obj15-product-website'

const modules = [
  {
    href: '/dns-dashboard',
    title: 'OBJ-28 DNS Overview Dashboard',
    description:
      'Terminal-Style Live-Übersicht: Forward DNS Server, Zonen, Topologie, globale Statistiken.',
  },
  {
    href: '/capabilities',
    title: 'OBJ-29 Capabilities Overview',
    description:
      'Terminal-Style Übersicht über FMN-Capabilities, Services, Functions und Requirements.',
  },
  {
    href: '/documentation',
    title: 'Dokumentation Hub',
    description:
      'Zentraler Einstieg fuer Service-, arc42- und Betriebsdokumentation.',
  },
  {
    href: '/maturity',
    title: 'OBJ-16 Maturitaetsstatus',
    description:
      'L0-L5 Reifegrad mit Bewertungslogik, Risiken und druckfreundlicher Sicht.',
  },
  {
    href: '/security-posture',
    title: 'OBJ-17 SBOM & Security Scanning',
    description:
      'Security-Bundles, Scanstatus und Gate-Entscheid pro Version einsehen.',
  },
  {
    href: '/zone-generator',
    title: 'OBJ-6 DNS Zone File Generator',
    description:
      'Forward- und Reverse-Zone-Files aus OBJ-5 Participant-Daten generieren.',
  },
  {
    href: '/participant-config',
    title: 'OBJ-5 Participant Configuration Form',
    description:
      'DNS-Teilnehmerdaten erfassen, validieren und via API speichern.',
  },
  {
    href: '/test-execution-dashboard',
    title: 'OBJ-23 Test Execution Dashboard',
    description: 'Teststatus (Passed/Failed/Never Executed) ueberblicken.',
  },
  {
    href: '/requirements-traceability',
    title: 'OBJ-7 Requirements Traceability View',
    description:
      'Requirement-Abdeckung aus Capabilities und OBJ-5-Konfiguration nachvollziehen.',
  },
  {
    href: '/export-download',
    title: 'OBJ-8 Export & Download',
    description:
      'DNS-Artefakte einzeln oder als ZIP offline exportieren und JSON importieren.',
  },
  {
    href: '/test-runner',
    title: 'OBJ-9 Manual Test Runner',
    description: 'Manuelle Testfaelle direkt im Browser durchlaufen.',
  },
  {
    href: '/api/v1/swagger',
    title: 'OBJ-3 API Swagger',
    description: 'API-Dokumentation fuer die REST-Endpunkte anzeigen.',
  },
  {
    href: '/documentation',
    title: 'Dokumentation',
    description: 'Dokumentationsportal, API-Docs und Architektur-Nachweise.',
  },
]

export default async function Home() {
  const productWebsiteData = await getProductWebsiteViewModel()

  const channelBadgeClassName =
    productWebsiteData.release.channel === 'released'
      ? 'border-emerald-200 bg-emerald-100 text-emerald-900'
      : productWebsiteData.release.channel === 'beta'
        ? 'border-amber-200 bg-amber-100 text-amber-900'
        : 'border-sky-200 bg-sky-100 text-sky-900'

  const releaseDateLabel = productWebsiteData.release.publishedAt
    ? new Date(productWebsiteData.release.publishedAt).toLocaleDateString('de-CH', {
        dateStyle: 'medium',
      })
    : 'Nicht veroeffentlicht'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <ReleaseUpdateNotice />

        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {productWebsiteData.service.name}
              </h1>
              <p className="mt-2 text-sm text-slate-700">
                {productWebsiteData.service.shortDescription}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Fuer {productWebsiteData.service.audience}
              </p>
              <p className="mt-1 text-sm text-slate-600">{productWebsiteData.service.purpose}</p>
            </div>

            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 md:max-w-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Aktueller Stand
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {productWebsiteData.release.version}
              </p>
              <p className="mt-1 text-sm text-slate-600">Release-Datum: {releaseDateLabel}</p>
              <span
                className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${channelBadgeClassName}`}
              >
                {productWebsiteData.release.channelLabel}
              </span>
              <p className="mt-2 text-sm text-slate-600">
                {productWebsiteData.release.channelRiskHint}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Betriebskontext: {productWebsiteData.service.operatingContext}
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Status-Legende</h2>
          <p className="mt-2 text-sm text-slate-600">
            Einheitliche Kanal-Semantik fuer GUI, Doku und Releases.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {productWebsiteData.channelLegend.map((entry) => (
              <article key={entry.channel} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                <p className="mt-1 text-sm text-slate-600">{entry.riskHint}</p>
              </article>
            ))}
          </div>
        </section>

        <Obj15UpdateHints
          currentVersion={productWebsiteData.release.version}
          notices={productWebsiteData.updateNotices}
          checkedAt={productWebsiteData.updatedAt}
        />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Source of Truth</h2>
            <p className="mt-2 text-sm text-slate-600">
              Primaerquelle: {productWebsiteData.sourceOfTruth.primary}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Release-Datei: {productWebsiteData.sourceOfTruth.releaseNoticesFile}
            </p>
            <p className="mt-2 text-sm text-slate-700">{productWebsiteData.sourceOfTruth.note}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Maturitaetsstatus</h2>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {productWebsiteData.maturity.label}
            </p>
            <p className="mt-1 text-sm text-slate-600">{productWebsiteData.maturity.summary}</p>
            <p className="mt-2 text-xs text-slate-500">
              Letzte Aktualisierung:{' '}
              {productWebsiteData.maturity.updatedAt ?? 'keine Datenquelle vorhanden'}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Schnellnavigation</h2>
          <p className="mt-2 text-sm text-slate-600">
            Direktzugriff auf App, Dokumentation und Release-Informationen.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {productWebsiteData.navigation.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                target={entry.type === 'external' ? '_blank' : undefined}
                rel={entry.type === 'external' ? 'noreferrer noopener' : undefined}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                {entry.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-100"
            >
              <h2 className="text-base font-semibold text-slate-900 group-hover:text-slate-950">
                {module.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
