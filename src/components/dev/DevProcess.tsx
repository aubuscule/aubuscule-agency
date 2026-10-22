import { useTranslations } from 'next-intl'

const STEP_KEYS = ['s1', 's2', 's3'] as const

export function DevProcess() {
  const t = useTranslations('dev.process')

  return (
    <section className="dev-section" id="methode" aria-labelledby="dev-process-heading">
      <div className="dev-section-header">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h2 className="dev-section-h2" id="dev-process-heading">
          {t('h2')}
        </h2>
        <p className="dev-section-lead">{t('lead')}</p>
      </div>

      <ul className="dev-process-grid" role="list">
        {STEP_KEYS.map((key) => (
          <li key={key} className="dev-process-card">
            <span className="dev-process-num" aria-hidden="true">
              {t(`steps.${key}.num`)}
            </span>
            <h3 className="dev-process-title">{t(`steps.${key}.title`)}</h3>
            <p className="dev-process-text">{t(`steps.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
