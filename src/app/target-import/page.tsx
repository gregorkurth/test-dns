import {
  getLatestObj20TargetImportRun,
  getObj20TargetImportSummary,
  loadObj20TargetImportDocument,
} from '@/lib/obj20-target-import'

import { Obj20TargetImportDashboard } from './target-import-dashboard'

export default async function TargetImportPage() {
  const [document, summary, latestRun] = await Promise.all([
    loadObj20TargetImportDocument(),
    getObj20TargetImportSummary(),
    getLatestObj20TargetImportRun(),
  ])

  return (
    <Obj20TargetImportDashboard
      document={document}
      summary={summary}
      latestRun={latestRun}
    />
  )
}
