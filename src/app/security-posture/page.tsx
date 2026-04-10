import { Obj17SecurityOverview } from '@/components/obj17-security-overview'
import {
  getObj17SecurityBundles,
  getObj17SecuritySummary,
  loadObj17SecurityDocument,
} from '@/lib/obj17-security-scanning'

export default async function SecurityPosturePage() {
  const [document, summary, bundles] = await Promise.all([
    loadObj17SecurityDocument(),
    getObj17SecuritySummary(),
    getObj17SecurityBundles(),
  ])

  return (
    <Obj17SecurityOverview
      sourceOfTruth={document.sourceOfTruth}
      updatedAt={document.updatedAt}
      summary={summary}
      bundles={bundles}
    />
  )
}
