import { Obj18RegistryDashboard } from './registry-dashboard'

import { loadObj18RegistryData } from '@/lib/obj18-artifact-registry'

export default async function RegistryPage() {
  const data = await loadObj18RegistryData()

  return <Obj18RegistryDashboard data={data} />
}
