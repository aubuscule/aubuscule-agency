import { useTranslations } from 'next-intl'

const PRINCIPLE_KEYS = [
  'kiss',
  'components',
  'noSurprises',
  'yagni',
  'lean',
  'openSource',
] as const

export function DevPrinciples() {
  const t = useTranslations('dev.principles')

  return (
    <section className="dev-section" id="principes" aria-labelledby="dev-principles-heading">
      <div className="dev-section-header">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h2 className="dev-section-h2" id="dev-principles-heading">
          {t('h2')}
        </h2>
        <p className="dev-section-lead">{t('lead')}</p>
      </div>

      <ul className="dev-principles-grid" role="list">
        {PRINCIPLE_KEYS.map((key) => (
          <li key={key} className="dev-principle-card">
            <div className="dev-principle-header">
              <span className="dev-principle-num" aria-hidden="true">
                {t(`items.${key}.num`)}
              </span>
              <h3 className="dev-principle-title">{t(`items.${key}.title`)}</h3>
            </div>
            <blockquote className="dev-principle-quote">
              &laquo; {t(`items.${key}.quote`)} &raquo;
            </blockquote>
            <p className="dev-principle-text">{t(`items.${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
