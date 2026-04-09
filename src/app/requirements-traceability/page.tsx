import { loadObj7TraceabilityData } from '@/lib/obj7-traceability'

import { TraceabilityClient } from './traceability-client'

export default async function RequirementsTraceabilityPage() {
  const data = await loadObj7TraceabilityData()
  return <TraceabilityClient initialData={data} />
}
