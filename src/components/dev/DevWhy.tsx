import { useTranslations } from 'next-intl'

const WHY_KEYS = ['fit', 'noRent', 'time', 'control'] as const

export function DevWhy() {
  const t = useTranslations('dev.why')

  return (
    <section className="dev-section" id="pourquoi" aria-labelledby="dev-why-heading">
      <div className="dev-section-header">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h2 className="dev-section-h2" id="dev-why-heading">
          {t('h2')}
        </h2>
        <p className="dev-section-lead">{t('lead')}</p>
      </div>

      <ul className="dev-why-grid" role="list">
        {WHY_KEYS.map((key) => (
          <li key={key} className="dev-why-card">
            <div className="dev-why-header">
              <span className="dev-why-num" aria-hidden="true">
                {t(`items.${key}.num`)}
              </span>
              <h3 className="dev-why-title">{t(`items.${key}.title`)}</h3>
            </div>
            <p className="dev-why-text">{t(`items.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
