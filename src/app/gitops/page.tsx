import {
  getObj21GitOpsSummary,
  loadObj21GitOpsDocument,
} from '@/lib/obj21-gitops'

import { GitOpsDashboard } from './gitops-dashboard'

export default async function GitOpsPage() {
  const [document, summary] = await Promise.all([
    loadObj21GitOpsDocument(),
    getObj21GitOpsSummary(),
  ])

  return <GitOpsDashboard document={document} summary={summary} />
}
