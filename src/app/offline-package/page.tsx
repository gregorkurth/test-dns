import { OfflinePackageDashboard } from '@/app/offline-package/offline-package-dashboard'
import {
  getObj19OfflinePackageSummary,
  loadObj19OfflinePackageDocument,
} from '@/lib/obj19-offline-package'

export default async function OfflinePackagePage() {
  const [document, summary] = await Promise.all([
    loadObj19OfflinePackageDocument(),
    getObj19OfflinePackageSummary(),
  ])

  return (
    <OfflinePackageDashboard
      sourceOfTruth={document.sourceOfTruth}
      updatedAt={document.updatedAt}
      summary={summary}
      packages={document.packages}
    />
  )
}
