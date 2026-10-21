import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dev.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/dev`,
      languages: {
        fr: '/fr/dev',
        en: '/en/dev',
        nl: '/nl/dev',
        'x-default': '/fr/dev',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_BE' : locale === 'nl' ? 'nl_BE' : 'en_US',
      type: 'website',
      url: `${SITE_URL}/${locale}/dev`,
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

export default async function DevLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Aubuscule — Ingénierie logicielle & Automatisation',
    description:
      locale === 'fr'
        ? 'Conception logicielle sur mesure, intégration de systèmes et automatisation de processus métier.'
        : 'Custom software engineering, system integration, and workflow automation.',
    url: `${SITE_URL}/${locale}/dev`,
    image: `${SITE_URL}/img/og-image.png`,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bruxelles',
      addressCountry: 'BE',
    },
    knowsAbout: [
      'Custom Software Development',
      'Workflow Automation',
      'Systems Integration',
      'Desktop Applications (Tauri, Rust)',
      'Web Platforms (Next.js, Python)',
      'Cloudflare Workers & Edge Computing',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
