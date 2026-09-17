'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Mark } from './Mark'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const pathname = usePathname()

  if (pathname === '/') return null

  const navLinks = [
    { href: '/', label: tNav('home') },
    { href: '/agency', label: tNav('agency') },
    { href: '/portfolio', label: tNav('portfolio') },
  ] as const

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <Mark idPrefix="f" inkColor="url(#footerMarkGradient)" style={{ width: 34, height: 34, flexShrink: 0 }}>
              <linearGradient id="footerMarkGradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
                <stop offset="0%" stopColor="var(--hero-accent-1)" />
                <stop offset="50%" stopColor="var(--hero-accent-2)" />
                <stop offset="100%" stopColor="var(--hero-accent-1)" />
                <animate attributeName="x1" values="0; 200" dur="8s" repeatCount="indefinite" />
                <animate attributeName="x2" values="200; 400" dur="8s" repeatCount="indefinite" />
              </linearGradient>
            </Mark>
            <span className="footer-wordmark">Aubuscule</span>
          </Link>
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

