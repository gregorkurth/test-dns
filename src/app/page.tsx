import Link from 'next/link'

const modules = [
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
    href: '/test-runner',
    title: 'OBJ-9 Manual Test Runner',
    description: 'Manuelle Testfaelle direkt im Browser durchlaufen.',
  },
  {
    href: '/api/v1/swagger',
    title: 'OBJ-3 API Swagger',
    description: 'API-Dokumentation fuer die REST-Endpunkte anzeigen.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            DNS Management Service Workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Startseite fuer die wichtigsten Module. Fokus aktuell: OBJ-5
            Participant Configuration Form.
          </p>
        </header>

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
