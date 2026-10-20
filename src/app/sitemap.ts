import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { locales } from '@/i18n/config'

// Only publicly-linked, ready pages.
export default function sitemap(): MetadataRoute.Sitemap {
  // Static date to avoid unnecessary re-crawling of unchanged pages on every build.
  // Update this when content actually changes.
  const lastModified = new Date('2026-10-20')
  const paths = [
    '',
    '/agency',
    '/products',
    '/products/remplate',
    '/products/remplate/templates',
    '/products/remplate/faq',
    '/products/zones-tonales',
  ]

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
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
