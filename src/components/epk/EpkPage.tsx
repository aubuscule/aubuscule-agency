import Image from 'next/image'
import { useTranslations } from 'next-intl'

const SHALE_URL = 'https://epk.aubuscule.com/shale/'
const ITEM_KEYS = ['site', 'kit', 'fast', 'link'] as const

export function EpkPage() {
  const t = useTranslations('epk')

  const mailtoUrl = `mailto:contact@aubuscule.com?subject=${encodeURIComponent(
    t('cta.subject')
  )}&body=${encodeURIComponent(t('cta.body'))}`

  return (
    <main id="main-content">
      <div className="wrap">
        <section className="epk-hero" aria-labelledby="epk-hero-heading">
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="epk-h1" id="epk-hero-heading">
            {t('hero.h1')}
          </h1>
          <p className="epk-sub">{t('hero.sub')}</p>
          <div className="epk-ctas">
            <a href="#contact" className="btn-primary">
              {t('hero.ctaPrimary')}
            </a>
            <a href={SHALE_URL} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t('hero.ctaExample')}
            </a>
          </div>
        </section>

        <section className="epk-section" id="example" aria-labelledby="epk-proof-heading">
          <div className="epk-header">
            <p className="eyebrow">{t('proof.eyebrow')}</p>
            <h2 className="epk-h2" id="epk-proof-heading">
              {t('proof.h2')}
            </h2>
            <p className="epk-lead">{t('proof.lead')}</p>
          </div>
          <a
            href={SHALE_URL}
            className="epk-shot card"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('proof.link')}
          >
            <Image src="/img/shale-epk.jpg" alt={t('proof.imageAlt')} width={1280} height={800} sizes="(max-width: 1120px) 100vw, 1040px" />
          </a>
          <a href={SHALE_URL} className="epk-link" target="_blank" rel="noopener noreferrer">
            {t('proof.link')} &rarr;
          </a>
        </section>

        <section className="epk-section" aria-labelledby="epk-included-heading">
          <div className="epk-header">
            <p className="eyebrow">{t('included.eyebrow')}</p>
            <h2 className="epk-h2" id="epk-included-heading">
              {t('included.h2')}
            </h2>
            <p className="epk-lead">{t('included.lead')}</p>
          </div>
          <ul className="epk-grid" role="list">
            {ITEM_KEYS.map((key, i) => (
              <li key={key} className="epk-card card">
                <span className="label" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="epk-card-title">{t(`included.items.${key}.title`)}</h3>
                <p className="epk-card-text">{t(`included.items.${key}.text`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="epk-section" aria-labelledby="epk-offer-heading">
          <div className="epk-header">
            <p className="eyebrow">{t('offer.eyebrow')}</p>
            <h2 className="epk-h2" id="epk-offer-heading">
              {t('offer.h2')}
            </h2>
          </div>
          <div className="epk-offer card">
            <dl className="epk-facts">
              <div>
                <dt className="label-sm">{t('offer.priceLabel')}</dt>
                <dd className="epk-fact">{t('offer.price')}</dd>
              </div>
              <div>
                <dt className="label-sm">{t('offer.turnaroundLabel')}</dt>
                <dd className="epk-fact">{t('offer.turnaround')}</dd>
              </div>
            </dl>
            <p className="epk-guarantee">{t('offer.guarantee')}</p>
          </div>
        </section>

        <section className="epk-section epk-section-last" id="contact" aria-labelledby="epk-cta-heading">
          <div className="epk-header">
            <p className="eyebrow">{t('cta.eyebrow')}</p>
            <h2 className="epk-h2" id="epk-cta-heading">
              {t('cta.h2')}
            </h2>
            <p className="epk-lead">{t('cta.lead')}</p>
          </div>
          <div className="epk-ctas">
            <a href={mailtoUrl} className="btn-primary">
              {t('cta.button')}
            </a>
            <span className="epk-notice">{t('cta.notice')}</span>
          </div>
        </section>
      </div>
    </main>
  )
}
