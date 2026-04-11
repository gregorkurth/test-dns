import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const documentationEntries = [
  {
    title: 'Startseite Dokumentation',
    path: 'docs/README.md',
    summary: 'Einstieg in alle Doku-Bereiche mit Verlinkungen.',
  },
  {
    title: 'Service Vision',
    path: 'docs/SVC.md',
    summary: 'Serviceziel, Scope und Roadmap auf Management-Niveau.',
  },
  {
    title: 'arc42 Index',
    path: 'docs/arc42/README.md',
    summary: 'Architekturkapitel, Pflegehinweise und Exportstruktur.',
  },
  {
    title: 'Dokumentations-Guide',
    path: 'docs/DOCUMENTATION-GUIDE.md',
    summary: 'Prozess, Rollen, Nachweise und Source-of-Truth-Regeln.',
  },
]

const relatedRoutes = [
  {
    title: 'API Dokumentation (Swagger)',
    href: '/api/v1/swagger',
  },
  {
    title: 'Release-Informationen',
    href: '/api/v1/releases',
  },
  {
    title: 'Maturity Dashboard',
    href: '/maturity',
  },
  {
    title: 'Security Posture',
    href: '/security-posture',
  },
]

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Documentation Hub</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Dokumentation und Nachweise
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Git bleibt die Primaerquelle. Diese Seite zeigt, wo die relevanten
            Dokumente im Repository liegen und welche Lesesichten direkt in der App verfuegbar sind.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {documentationEntries.map((entry) => (
            <Card key={entry.path} className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{entry.summary}</p>
                <p className="mt-3 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                  {entry.path}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Direkte Lesesichten</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                {route.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
