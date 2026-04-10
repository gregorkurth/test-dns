import { Obj16MaturityDashboard } from '@/components/obj16-maturity-dashboard'
import { loadObj16MaturityData } from '@/lib/obj16-maturity'

export default async function MaturityPage() {
  const data = await loadObj16MaturityData()
  return <Obj16MaturityDashboard initialData={data} />
}
