import type { NextConfig } from 'next'

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

  async rewrites() {
    // MkDocs static site is served from public/docs/ (OBJ-27).
    // use_directory_urls: false in mkdocs.yml generates flat .html files,
    // so all internal nav links are explicit (e.g. operations.html).
    // Only the entry point /docs needs rewriting to /docs/index.html.
    return [{ source: '/docs', destination: '/docs/index.html' }]
  },
}

export default nextConfig
