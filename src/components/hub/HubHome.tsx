'use client'

import { useRef, useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { locales } from '@/i18n/config'
import { Select } from '@/components/shared/Select'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Mark } from '@/components/shared/Mark'
import { Starfield } from './Starfield'

interface HubCard {
  key: string
  href: string
  external?: boolean
}

const cards: HubCard[] = [
  {
    key: 'agency',
    href: '/agency',
  },
  {
    key: 'portfolio',
    href: '/portfolio',
  },
]

export function HubHome() {
  const t = useTranslations('home')
  const heroRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <main id="main-content" className="hub-page">
      <header className="hub-header">
        <Select
          value={currentLocale}
          onChange={(nextLocale) => router.replace(pathname, { locale: nextLocale as 'fr' | 'en' | 'nl' })}
          options={locales.map(loc => ({ value: loc, label: loc.toUpperCase() }))}
          align="right"
          className="nav-lang-select"
        />
        <ThemeToggle />
      </header>
      <section
        ref={heroRef}
        className={`hub-hero ${visible ? 'hub-hero--visible' : ''}`}
        aria-labelledby="hub-heading"
      >
        <Starfield />
        <div className="hub-hero-parallax">
          <Mark idPrefix="hub" className="hub-mark-svg" inkColor="url(#hubMarkGradient)">
            <linearGradient id="hubMarkGradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
              <stop offset="0%" stopColor="var(--hero-accent-1)" />
              <stop offset="50%" stopColor="var(--hero-accent-2)" />
              <stop offset="100%" stopColor="var(--hero-accent-1)" />
              <animate attributeName="x1" values="0; 200" dur="8s" repeatCount="indefinite" />
              <animate attributeName="x2" values="200; 400" dur="8s" repeatCount="indefinite" />
            </linearGradient>
          </Mark>
        </div>
        <h1 className="hub-h1" id="hub-heading">Aubuscule</h1>
        <p className="hub-sub">{t('subtitle')}</p>

        <section className="hub-cards" aria-label={t('cardsSectionLabel')}>
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="hub-card"
              {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="label hub-card-label">{t(`cards.${card.key}.label`)}</span>
              <span className="hub-card-title">{t(`cards.${card.key}.title`)}</span>
              <span className="hub-card-desc">{t(`cards.${card.key}.desc`)}</span>
            </Link>
          ))}
        </section>
      </section>
    </main>
  )
}

