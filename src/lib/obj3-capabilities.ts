import { promises as fs } from 'node:fs'
import path from 'node:path'

import { emitFailureSignal, emitSuccessSignal } from '@/lib/obj11-observability'

interface CapabilityRequirementNode {
  id: string
}

interface CapabilityServiceFunctionNode {
  id: string
  name: string
  requirements: CapabilityRequirementNode[]
}

interface CapabilityServiceNode {
  id: string
  name: string
  serviceFunctions: CapabilityServiceFunctionNode[]
}

export interface CapabilityNode {
  id: string
  name: string
  maturity?: string
  path?: string
  services: CapabilityServiceNode[]
}

interface CapabilityDashboardFile {
  generatedAt: string
  capabilities: CapabilityNode[]
}

const dashboardCapabilitiesPath = path.join(
  process.cwd(),
  'capability-dashboard-live',
  'data',
  'capabilities-dashboard.json',
)

async function loadCapabilitiesRaw(): Promise<CapabilityDashboardFile> {
  const raw = await fs.readFile(dashboardCapabilitiesPath, 'utf8')
  const parsed = JSON.parse(raw) as CapabilityDashboardFile

  if (!Array.isArray(parsed.capabilities)) {
    throw new Error('Capabilities-Daten sind ungueltig formatiert.')
  }

  return parsed
}

function countServiceFunctions(services: CapabilityServiceNode[]): number {
  let total = 0
  for (const service of services) {
    total += service.serviceFunctions?.length ?? 0
  }
  return total
}

function countRequirements(services: CapabilityServiceNode[]): number {
  let total = 0
  for (const service of services) {
    for (const serviceFunction of service.serviceFunctions ?? []) {
      total += serviceFunction.requirements?.length ?? 0
    }
  }
  return total
}

export async function listCapabilities() {
  const data = await loadCapabilitiesRaw()
  const capabilities = data.capabilities.map((capability) => ({
    id: capability.id,
    name: capability.name,
    maturity: capability.maturity ?? null,
    serviceCount: capability.services?.length ?? 0,
    serviceFunctionCount: countServiceFunctions(capability.services ?? []),
    requirementCount: countRequirements(capability.services ?? []),
  }))

  await emitSuccessSignal({
    name: 'dns.capabilities.listed',
    operation: 'capabilities.list',
    route: '/api/v1/capabilities',
    statusCode: 200,
    attributes: {
      'capability.count': capabilities.length,
    },
  })

  return capabilities
}

export async function getCapabilityById(
  id: string,
): Promise<CapabilityNode | null> {
  const normalizedId = id.trim().toUpperCase()
  if (!normalizedId) {
    return null
  }

  const data = await loadCapabilitiesRaw()
  const capability =
    data.capabilities.find(
      (capability) => capability.id.toUpperCase() === normalizedId,
    ) ?? null

  if (capability) {
    await emitSuccessSignal({
      name: 'dns.capability.loaded',
      operation: 'capabilities.detail',
      route: `/api/v1/capabilities/${normalizedId}`,
      statusCode: 200,
      attributes: {
        capability_id: capability.id,
      },
    })
  } else {
    await emitFailureSignal({
      name: 'dns.capability.missing',
      operation: 'capabilities.detail',
      route: `/api/v1/capabilities/${normalizedId}`,
      statusCode: 404,
      severity: 'WARN',
      outcome: 'failure',
      attributes: {
        capability_id: normalizedId,
      },
    })
  }

  return capability
}
