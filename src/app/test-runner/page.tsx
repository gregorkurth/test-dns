import { loadManualTests } from '@/lib/test-runner'
import { TestRunnerClient } from './TestRunnerClient'

export default async function TestRunnerPage() {
  const tests = await loadManualTests()
  return <TestRunnerClient tests={tests} />
}
