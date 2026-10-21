import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; form-action 'self' mailto:; frame-ancestors 'none'",
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

// Single-domain, path-based routing (aubuscule.com/agency, /products, …) — pure Next
// routing, no host inspection. Old subdomains 301 to these paths via Cloudflare
// redirect rules (see TODO.md Epic 2). `shop`/`remplate` shortcuts below have no
// host condition, so the OpenNext `has:host` limitation doesn't apply.
const nextConfig: NextConfig = {
  // SSR on Cloudflare Workers via @opennextjs/cloudflare — no static export.
  //
  // Images are served unoptimized by design for now. Switching to a Cloudflare
  // Images loader is deferred until Image Resizing is enabled on the zone
  // (tracked in TODO.md, Epic 1) — it requires paid zone config, not code.
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      { source: '/', destination: '/fr', permanent: true },
      { source: '/shop', destination: 'https://aubuscule.gumroad.com', permanent: true },

      // Product shortcuts (unlocalized)
      { source: '/remplate', destination: '/fr/products/remplate', permanent: true },
      { source: '/remplate/:path*', destination: '/fr/products/remplate/:path*', permanent: true },
      { source: '/zones-tonales', destination: '/fr/products/zones-tonales', permanent: true },
      { source: '/zones-tonales/:path*', destination: '/fr/products/zones-tonales/:path*', permanent: true },

      // Product shortcuts (localized)
      { source: '/:locale(fr|en|nl)/remplate', destination: '/:locale/products/remplate', permanent: true },
      { source: '/:locale(fr|en|nl)/remplate/:path*', destination: '/:locale/products/remplate/:path*', permanent: true },
      { source: '/:locale(fr|en|nl)/zones-tonales', destination: '/:locale/products/zones-tonales', permanent: true },
      { source: '/:locale(fr|en|nl)/zones-tonales/:path*', destination: '/:locale/products/zones-tonales/:path*', permanent: true },

      // Unlocalized direct products access -> default locale
      { source: '/products', destination: '/fr/products', permanent: true },
      { source: '/products/:path*', destination: '/fr/products/:path*', permanent: true },

      // Legacy portfolio redirects
      { source: '/portfolio', destination: '/fr/products', permanent: true },
      { source: '/portfolio/:path*', destination: '/fr/products/:path*', permanent: true },
      { source: '/:locale(fr|en|nl)/portfolio', destination: '/:locale/products', permanent: true },
      { source: '/:locale(fr|en|nl)/portfolio/:path*', destination: '/:locale/products/:path*', permanent: true },

      // Legacy réalisations redirects
      { source: '/realisations', destination: '/fr/products', permanent: true },
      { source: '/realisations/:path*', destination: '/fr/products/:path*', permanent: true },
      { source: '/:locale(fr|en|nl)/realisations', destination: '/:locale/products', permanent: true },
      { source: '/:locale(fr|en|nl)/realisations/:path*', destination: '/:locale/products/:path*', permanent: true },

      // Legacy apps redirects
      { source: '/apps', destination: '/fr/products', permanent: true },
      { source: '/apps/remplate', destination: '/fr/products/remplate', permanent: true },
      { source: '/apps/remplate/templates', destination: '/fr/products/remplate/templates', permanent: true },
      { source: '/apps/remplate/faq', destination: '/fr/products/remplate/faq', permanent: true },
      { source: '/apps/zones-tonales', destination: '/fr/products/zones-tonales', permanent: true },
      { source: '/:locale(fr|en|nl)/apps', destination: '/:locale/products', permanent: true },
      { source: '/:locale(fr|en|nl)/apps/:path*', destination: '/:locale/products/:path*', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
