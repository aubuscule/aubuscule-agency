import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  return {
    title: slug,
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: {
        fr: `/fr/products/${slug}`,
        en: `/en/products/${slug}`,
        nl: `/nl/products/${slug}`,
        'x-default': `/fr/products/${slug}`,
      },
    },
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params

  if (slug === 'remplate') {
    notFound()
  }

  notFound()
}
