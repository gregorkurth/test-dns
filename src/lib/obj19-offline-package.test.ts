import { describe, expect, it } from 'vitest'

import {
  getLatestObj19OfflinePackage,
  getObj19OfflinePackageSummary,
  loadObj19OfflinePackageDocument,
} from '@/lib/obj19-offline-package'

describe('OBJ-19 offline package metadata', () => {
  it('loads package descriptors with manifest, checksums and handover data', async () => {
    const document = await loadObj19OfflinePackageDocument()

    expect(document.service).toBe('DNS Management Service')
    expect(document.packages).toHaveLength(2)
    expect(document.packages[0]).toMatchObject({
      version: 'v1.0.0-beta.1',
      variant: 'full',
      importReady: true,
      releaseAssigned: true,
    })
    expect(document.packages[0].manifest.images.length).toBeGreaterThan(0)
    expect(document.packages[0].checksums.length).toBeGreaterThan(0)
    expect(document.packages[0].handover.transferMedium).toBe('USB')
  })

  it('derives a summary for the dashboard and API', async () => {
    const summary = await getObj19OfflinePackageSummary()

    expect(summary.totalPackages).toBe(2)
    expect(summary.latestVersion).toBe('v1.0.0-beta.1')
    expect(summary.variantsAvailable).toEqual(['full', 'minimal'])
    expect(summary.packagesWithOfflineDb).toBe(1)
  })

  it('returns the newest package record', async () => {
    const latest = await getLatestObj19OfflinePackage()

    expect(latest).not.toBeNull()
    expect(latest?.variant).toBe('full')
    expect(latest?.security.offlineDbIncluded).toBe(true)
  })
})
