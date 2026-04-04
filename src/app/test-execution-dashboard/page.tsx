import { loadTestExecutionDashboardData } from '@/lib/test-execution-dashboard'

import { TestExecutionDashboardClient } from './test-execution-dashboard-client'

export default async function TestExecutionDashboardPage() {
  const data = await loadTestExecutionDashboardData()
  return <TestExecutionDashboardClient initialData={data} />
}
