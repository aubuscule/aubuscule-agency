import { getTranslations } from 'next-intl/server'
import { AppSubNav } from '@/components/products/AppSubNav'

export default async function RemplateLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'remplate.subnav' })

  const navItems = [
    { href: '/products/remplate', label: t('overview') },
    { href: '/products/remplate/templates', label: t('templates') },
    { href: '/products/remplate/faq', label: t('faq') },
  ]

  return (
    <main id="main-content">
      <AppSubNav items={navItems} />
      <div className="wrap">
        {children}
      </div>
    </main>
  )
}
