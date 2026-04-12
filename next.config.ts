import type { NextConfig } from 'next'

// Erlaubte Origins für CORS (S-13).
// Im Airgap-Betrieb ist der Wert typischerweise leer – dann wird kein
// Access-Control-Allow-Origin Header gesetzt und Same-Origin erzwungen.
// Für Multi-Origin-Deployments: NEXT_PUBLIC_ALLOWED_ORIGINS=https://a.example,https://b.example
const allowedOrigins = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
