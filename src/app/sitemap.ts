import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { locales } from '@/i18n/config'
import sitemapDates from '@/lib/sitemap-dates.json'

// Canonical list of public route paths included in sitemap.xml.
// Route inputs and dates are derived automatically (npm run sitemap:stamp).
export const sitemapPaths = [
  '',
  '/agency',
  '/products',
  '/products/remplate',
  '/products/remplate/templates',
  '/products/remplate/faq',
  '/products/zones-tonales',
  '/dev',
  '/epk',
] as const

// Only publicly-linked, ready pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const dates = sitemapDates as Record<string, { hash: string; date: string }>

  return sitemapPaths.flatMap((path) => {
    const entry = dates[path]
    const lastModified = entry?.date ? new Date(entry.date) : undefined
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      ...(lastModified ? { lastModified } : {}),
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
  })
}
