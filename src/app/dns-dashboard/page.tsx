import type { Metadata } from 'next'

import { DnsDashboardClient } from './dns-dashboard-client'

export const metadata: Metadata = {
  title: 'DNS Overview · DTS',
  description:
    'Terminal-style overview of Forward DNS servers, hosted zones, topology and global statistics.',
}

export default function DnsDashboardPage() {
  return <DnsDashboardClient />
}
