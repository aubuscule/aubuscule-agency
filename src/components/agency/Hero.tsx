import { useTranslations } from 'next-intl'
import { Mark } from '@/components/shared/Mark'

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-content">
        <p className="eyebrow" aria-hidden="true">{t('eyebrow')}</p>
        <h1 className="hero-h1" id="hero-heading">
          {t('h1')}
        </h1>
        <p className="hero-sub">
          {t.rich('sub', {
            bold: (chunks) => <strong>{chunks}</strong>
          })}
        </p>
        <div className="hero-ctas">
          <a href="#services" className="btn-primary">{t('ctaServices')}</a>
          <a href="#contact" className="btn-secondary">{t('ctaContact')}</a>
        </div>
      </div>
      <div className="hero-mark" aria-hidden="true">
        <Mark idPrefix="h" className="hero-mark-svg" inkColor="url(#agencyMarkGradient)">
          <linearGradient id="agencyMarkGradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
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

