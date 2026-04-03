import fs from 'fs'
import path from 'path'

export type StepStatus = 'open' | 'passed' | 'failed' | 'na'

export interface TestStep {
  number: number
  description: string
  status: StepStatus
  observation: string
}

export interface ManualTest {
  id: string
  requirementId: string
  oftTag: string
  oftCovers: string
  serviceFunctionId: string
  serviceFunctionName: string
  estimatedDuration: string
  preparations: string[]
  steps: TestStep[]
  expectedResult: string
  filePath: string
}

/** Map from directory name pattern to human-readable name */
const SERVICE_FUNCTION_NAMES: Record<string, string> = {
  'SFN-TIN26-dns-query': 'DNS Query (Authoritative)',
  'SFN-TIN370-dns-root': 'DNS Root Zone Hosting',
  'SFN-TIN43-zone-transfer': 'DNS Zone Transfer',
  'SFN-TIN114-anycast-dns': 'Anycast DNS Advertising',
  'SFN-RESOLV-query': 'Recursive DNS Resolution',
  'SFN-RESOLV-dnssec': 'DNSSEC Validation',
  'SFN-DNS-LOGGING': 'DNS Security & Event Logging',
}

function extractServiceFunctionId(dirName: string): string {
  // Extract the SFN-XXX part from directory names like "SFN-TIN26-dns-query"
  const match = dirName.match(/^(SFN-[A-Z0-9]+)/)
  return match ? match[1] : dirName
}

function extractServiceFunctionName(dirName: string): string {
  return SERVICE_FUNCTION_NAMES[dirName] ?? dirName
}

function findManualTestFiles(dir: string): string[] {
  const results: string[] = []

  if (!fs.existsSync(dir)) {
    return results
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findManualTestFiles(fullPath))
    } else if (
      entry.isFile() &&
      entry.name.endsWith('-manual.md') &&
      fullPath.includes(path.join('tests', 'manual'))
    ) {
      results.push(fullPath)
    }
  }

  return results
}

function parseManualTest(filePath: string, content: string): ManualTest {
  const fileName = path.basename(filePath, '.md')

  // Extract requirement ID from "> **Requirement:** [SREQ-234]..."
  const reqMatch = content.match(/>\s*\*\*Requirement:\*\*\s*\[([^\]]+)\]/)
  const requirementId = reqMatch ? reqMatch[1] : ''

  // Extract OFT tag: line with backtick containing "itest~"
  const oftTagMatch = content.match(/`(itest~[^`]+)`/)
  const oftTag = oftTagMatch ? oftTagMatch[1] : ''

  // Extract OFT covers: line starting with "Covers: "
  const oftCoversMatch = content.match(/Covers:\s*(.+)/)
  const oftCovers = oftCoversMatch ? oftCoversMatch[1].trim() : ''

  // Extract duration from "> **Geschaetzte Dauer:**"
  const durationMatch = content.match(/>\s*\*\*Geschaetzte Dauer:\*\*\s*(.+)/)
  const estimatedDuration = durationMatch ? durationMatch[1].trim() : ''

  // Extract service function from path
  // Path pattern: .../service-functions/SFN-XXX-name/tests/manual/...
  const sfMatch = filePath.match(/service-functions\/([^/]+)\/tests/)
  const sfDirName = sfMatch ? sfMatch[1] : ''
  const serviceFunctionId = extractServiceFunctionId(sfDirName)
  const serviceFunctionName = extractServiceFunctionName(sfDirName)

  // Extract sections by splitting on ## headings
  const sections = splitSections(content)

  // Preparations: bullet items under "## Testvorbereitung"
  const prepSection = sections['Testvorbereitung'] ?? ''
  const preparations = prepSection
    .split('\n')
    .filter((line) => line.match(/^\s*-\s+/))
    .map((line) => line.replace(/^\s*-\s+/, '').trim())

  // Steps: numbered items under "## Testschritte"
  const stepsSection = sections['Testschritte'] ?? ''
  const steps: TestStep[] = stepsSection
    .split('\n')
    .filter((line) => line.match(/^\s*\d+\.\s+/))
    .map((line, index) => {
      const desc = line.replace(/^\s*\d+\.\s+/, '').trim()
      return {
        number: index + 1,
        description: desc,
        status: 'open' as StepStatus,
        observation: '',
      }
    })

  // Expected result: text under "## Erwartetes Ergebnis"
  const expectedResult = (sections['Erwartetes Ergebnis'] ?? '').trim()

  return {
    id: fileName,
    requirementId,
    oftTag,
    oftCovers,
    serviceFunctionId,
    serviceFunctionName,
    estimatedDuration,
    preparations,
    steps,
    expectedResult,
    filePath,
  }
}

function splitSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = content.split(/^## /m)

  for (const part of parts) {
    const newlineIndex = part.indexOf('\n')
    if (newlineIndex === -1) continue
    const heading = part.substring(0, newlineIndex).trim()
    const body = part.substring(newlineIndex + 1)
    if (heading) {
      sections[heading] = body
    }
  }

  return sections
}

export async function loadManualTests(): Promise<ManualTest[]> {
  const capabilitiesDir = path.join(process.cwd(), 'capabilities')
  const files = findManualTestFiles(capabilitiesDir)

  const tests: ManualTest[] = []

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relativePath = path.relative(process.cwd(), filePath)
    tests.push(parseManualTest(relativePath, content))
  }

  // Sort by service function, then by test ID
  tests.sort((a, b) => {
    if (a.serviceFunctionName !== b.serviceFunctionName) {
      return a.serviceFunctionName.localeCompare(b.serviceFunctionName)
    }
    return a.id.localeCompare(b.id)
  })

  return tests
}
