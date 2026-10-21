import { useTranslations } from 'next-intl'

const DOMAIN_KEYS = ['desktop', 'web', 'automation', 'documents'] as const

export function DevDomains() {
  const t = useTranslations('dev.domains')

  return (
    <section className="dev-section" id="domaines" aria-labelledby="dev-domains-heading">
      <div className="dev-section-header">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h2 className="dev-section-h2" id="dev-domains-heading">
          {t('h2')}
        </h2>
        <p className="dev-section-lead">{t('lead')}</p>
      </div>

      <div className="dev-domains-grid">
        {DOMAIN_KEYS.map((key) => (
          <div className="dev-domain-card" key={key}>
            <span className="label dev-domain-num" aria-hidden="true">
              {t(`items.${key}.num`)}
            </span>
            <h3 className="dev-domain-name">{t(`items.${key}.title`)}</h3>
            <p className="dev-domain-desc">{t(`items.${key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
