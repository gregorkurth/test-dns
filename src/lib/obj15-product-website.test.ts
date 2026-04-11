import { describe, expect, it } from 'vitest'

import {
  getProductWebsiteViewModel,
  mapReleaseToObj15Channel,
  mapSeverityToObj15Priority,
} from '@/lib/obj15-product-website'

describe('OBJ-15 product website mapping', () => {
  it('maps release severity to UI priorities', () => {
    expect(mapSeverityToObj15Priority('high')).toBe('critical')
    expect(mapSeverityToObj15Priority('medium')).toBe('important')
    expect(mapSeverityToObj15Priority('low')).toBe('info')
  })

  it('maps release channel to released/beta/preview model', () => {
    expect(
      mapReleaseToObj15Channel({
        channel: 'ga',
        status: 'released',
      }),
    ).toBe('released')

    expect(
      mapReleaseToObj15Channel({
        channel: 'beta',
        status: 'planned',
      }),
    ).toBe('beta')

    expect(
      mapReleaseToObj15Channel({
        channel: 'rc',
        status: 'release-candidate',
      }),
    ).toBe('preview')
  })

  it('builds view model from versioned release source with fallback maturity', async () => {
    const model = await getProductWebsiteViewModel()

    expect(model.release.version).toMatch(/^v\d+\.\d+\.\d+/)
    expect(model.release.channel).toMatch(/released|beta|preview/)
    expect(model.channelLegend).toHaveLength(3)
    expect(model.sourceOfTruth.releaseNoticesFile).toBe('docs/releases/UPDATE-NOTICES.json')
    expect(Array.isArray(model.updateNotices)).toBe(true)
    expect(model.navigation.length).toBeGreaterThan(0)
    expect(model.navigation.some((entry) => entry.href === '/documentation')).toBe(true)
  })
})
