import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'epk.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/epk`,
      languages: {
        fr: '/fr/epk',
        en: '/en/epk',
        nl: '/nl/epk',
        'x-default': '/fr/epk',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_BE' : locale === 'nl' ? 'nl_BE' : 'en_US',
      type: 'website',
      url: `${SITE_URL}/${locale}/epk`,
      siteName: 'Aubuscule',
      images: [{ url: '/img/og-image.png', width: 1200, height: 630, alt: 'Aubuscule' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('ogDescription'),
      images: ['/img/og-image.png'],
    },
  }
}

export default function EpkLayout({ children }: { children: React.ReactNode }) {
  return children
}
