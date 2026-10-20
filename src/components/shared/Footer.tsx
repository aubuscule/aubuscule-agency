'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Logo } from './Logo'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const pathname = usePathname()

  if (pathname === '/') return null

  const navLinks = [
    { href: '/', label: tNav('home') },
    { href: '/agency', label: tNav('agency') },
    { href: '/products', label: tNav('products') },
  ] as const

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo />
          <p className="footer-tagline">
            {t('tagline')}
          </p>
        </div>
        <nav className="footer-cols" aria-label={t('ariaLabel')}>
          <div className="footer-col">
            <span className="label-sm footer-col-label">{t('colNavigate')}</span>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <span className="label-sm footer-col-label">{t('colContact')}</span>
            <a href="mailto:contact@aubuscule.com" className="footer-link">
              contact@aubuscule.com
            </a>
            <a href="https://www.instagram.com/aubuscule_agency/" className="footer-link footer-link-instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              @aubuscule_agency
            </a>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">&copy; 2026 Aubuscule</span>
        <span className="footer-copy">{t('artists')}</span>
      </div>
    </footer>
  )
}

