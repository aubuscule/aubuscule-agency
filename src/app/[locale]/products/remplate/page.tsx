import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RemplatePage } from '@/components/products/RemplatePage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'remplate.meta' })

  return {
    title: t('overviewTitle'),
    description: t('overviewDesc'),
    alternates: {
      canonical: `/${locale}/products/remplate`,
      languages: {
        fr: '/fr/products/remplate',
        en: '/en/products/remplate',
        nl: '/nl/products/remplate',
        'x-default': '/fr/products/remplate',
      },
    },
    openGraph: {
      title: t('overviewTitle'),
      description: t('overviewDesc'),
      images: [
        {
          url: '/apps/remplate/screenshot.png',
          width: 1440,
          height: 1036,
          alt: t('overviewTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('overviewTitle'),
      description: t('overviewDesc'),
      images: ['/apps/remplate/screenshot.png'],
    },
  }
}

export default async function RemplateRoute() {
  return <RemplatePage />
}
