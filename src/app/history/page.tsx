import { Obj24HistoryClient } from '@/app/history/history-client'
import {
  getObj24BaselineStatusView,
  getObj24HistoryEntries,
} from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const [baselineStatus, entries] = await Promise.all([
    getObj24BaselineStatusView(),
    getObj24HistoryEntries({ limit: 200 }),
  ])

  return <Obj24HistoryClient initialBaselineStatus={baselineStatus} initialEntries={entries} />
}
