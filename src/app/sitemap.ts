import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { locales } from '@/i18n/config'

// Only publicly-linked, ready pages.
export default function sitemap(): MetadataRoute.Sitemap {
  // Last content change per path (from git history of each page). Static on purpose:
  // the Workers build has no git checkout. Bump a path's date when its content changes.
  const paths: [string, string][] = [
    ['', '2026-09-08'],
    ['/agency', '2026-06-30'],
    ['/products', '2026-10-21'],
    ['/products/remplate', '2026-10-21'],
    ['/products/remplate/templates', '2026-10-21'],
    ['/products/remplate/faq', '2026-10-21'],
    ['/products/zones-tonales', '2026-10-21'],
    ['/dev', '2026-10-22'],
    ['/epk', '2026-10-24'],
  ]

  return paths.flatMap(([path, lastModified]) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(lastModified),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1.0 : 0.9,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((loc) => [loc, `${SITE_URL}/${loc}${path}`])
          ),
          'x-default': `${SITE_URL}/fr${path}`,
        },
      },
    }))
  )
}
