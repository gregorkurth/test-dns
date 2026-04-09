import { describe, expect, it } from 'vitest'

import { loadObj13OperatorData } from '@/lib/obj13-operator'

describe('loadObj13OperatorData', () => {
  it('loads the operator skeleton view with required status fields', async () => {
    const data = await loadObj13OperatorData()

    expect(data.customResource.kind).toBe('DNSConfiguration')
    expect(data.customResource.group).toBe('dns.fmn.mil')
    expect(data.customResource.version).toBe('v1alpha1')
    expect(data.customResource.hasRequiredStatusFields).toBe(true)
    expect(data.manifests.every((entry) => entry.present)).toBe(true)
  })

  it('keeps history sorted newest first and MCP guarded', async () => {
    const data = await loadObj13OperatorData()

    expect(data.history[0]?.timestamp >= data.history[1]?.timestamp).toBe(true)
    expect(data.mcpIntegration.mode).toBe('optional-secured')
    expect(data.mcpIntegration.guardrails.length).toBeGreaterThan(0)
  })
})
