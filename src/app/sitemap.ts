import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { locales } from '@/i18n/config'
import sitemapDates from '@/lib/sitemap-dates.json'

// Only publicly-linked, ready pages.
export default function sitemap(): MetadataRoute.Sitemap {
  // Last content change per path. Static on purpose: the Workers build has no git checkout.
  // Recomputed and stamped via content hash (npm run sitemap:stamp).
  const paths: [string, string][] = Object.entries(sitemapDates).map(
    ([path, data]) => [path, data.date]
  )

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
