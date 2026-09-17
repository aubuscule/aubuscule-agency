'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { locales } from '@/i18n/config'
import { Select } from '@/components/shared/Select'
import { Mark } from './Mark'
import { ThemeToggle } from './ThemeToggle'

type IconProps = { className?: string }

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function AgencyIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6" />
      <path d="M17 14.4a5.5 5.5 0 0 1 3.5 5.1" />
    </svg>
  )
}

function AppsIcon({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

const icons = {
  '/': HomeIcon,
  '/agency': AgencyIcon,
  '/portfolio': AppsIcon,
} as const

export function Nav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()

  if (pathname === '/') return null

  const links = [
    { href: '/', label: t('home') },
    { href: '/agency', label: t('agency') },
    { href: '/portfolio', label: t('portfolio') },
  ] as const

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <Mark idPrefix="n" style={{ width: 32, height: 32, flexShrink: 0 }} />
            <span className="nav-wordmark">Aubuscule</span>
          </Link>
          <nav aria-label={t('ariaLabel')} className="nav-area">
            <ul className="nav-links" id="nav-menu">
              {links.map(link => {
                const active = isActive(link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link${active ? ' nav-link--active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Select
              value={currentLocale}
              onChange={(nextLocale) => router.replace(pathname, { locale: nextLocale as 'fr' | 'en' | 'nl' })}
              options={locales.map(loc => ({ value: loc, label: loc.toUpperCase() }))}
              align="right"
              className="nav-lang-select"
            />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <nav className="tabbar" aria-label={t('ariaLabel')}>
        <ul className="tabbar-list">
          {links.map(link => {
            const active = isActive(link.href)
            const Icon = icons[link.href]
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`tabbar-link${active ? ' tabbar-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="tabbar-icon" />
                  <span className="tabbar-label">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
