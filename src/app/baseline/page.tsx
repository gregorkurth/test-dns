import { Obj24BaselineClient } from '@/app/baseline/baseline-client'
import { getObj24BaselineStatusView } from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

export default async function BaselinePage() {
  const baselineStatus = await getObj24BaselineStatusView()

  return <Obj24BaselineClient initialStatus={baselineStatus} />
}
