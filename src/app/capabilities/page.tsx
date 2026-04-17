import type { Metadata } from 'next'

import { CapabilitiesOverviewClient } from './capabilities-overview-client'

export const metadata: Metadata = {
  title: 'Capabilities · DTS',
  description:
    'Terminal-style overview of FMN capabilities with maturity, services and requirements metrics.',
}

export default function CapabilitiesOverviewPage() {
  return <CapabilitiesOverviewClient />
}
