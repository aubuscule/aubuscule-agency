import { useTranslations } from 'next-intl'
import { BOOKING_URL } from '@/lib/site'
import { Mark } from '@/components/shared/Mark'

export function DevHero() {
  const t = useTranslations('dev')

  return (
    <section className="dev-hero" aria-labelledby="dev-hero-heading">
      <div className="dev-hero-content">
        <p className="eyebrow" aria-hidden="true">
          {t('hero.eyebrow')}
        </p>
        <h1 className="dev-hero-h1" id="dev-hero-heading">
          {t('hero.h1')}
        </h1>
        <p className="dev-hero-sub">
          {t.rich('hero.sub', {
            bold: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <div className="dev-hero-ctas">
          <a href="#realisations" className="btn-primary">
            {t('hero.ctaShowcase')}
          </a>
          <a href={BOOKING_URL} className="btn-secondary" target="_blank" rel="noopener noreferrer">
            {t('hero.ctaCall')}
          </a>
        </div>
      </div>
      <div className="dev-hero-visual" aria-hidden="true">
        <Mark idPrefix="dev-h" className="dev-hero-svg" inkColor="url(#devHeroMarkGradient)">
          <linearGradient id="devHeroMarkGradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
            <stop offset="0%" stopColor="var(--hero-accent-1)" />
            <stop offset="50%" stopColor="var(--hero-accent-2)" />
            <stop offset="100%" stopColor="var(--hero-accent-1)" />
            <animate attributeName="x1" values="0; 200" dur="8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="200; 400" dur="8s" repeatCount="indefinite" />
          </linearGradient>
        </Mark>
      </div>
    </section>
  )
}
