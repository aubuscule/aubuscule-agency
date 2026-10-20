import { getTranslations } from 'next-intl/server'
import { ProductsGallery } from '@/components/products/ProductsGallery'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tMeta = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('products'),
    description: tMeta('siteDescription'),
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        fr: '/fr/products',
        en: '/en/products',
        nl: '/nl/products',
        'x-default': '/fr/products',
      },
    },
  }
}

export default async function ProductsHome() {
  return (
    <main id="main-content">
      <div className="wrap">
        <ProductsGallery />
      </div>
    </main>
  )
}
