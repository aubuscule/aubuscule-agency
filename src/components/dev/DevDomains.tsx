import { useTranslations } from 'next-intl'

const DOMAIN_CATEGORIES = [
  {
    key: 'desktop',
    itemKeys: ['native', 'localData', 'hardware'],
  },
  {
    key: 'webEdge',
    itemKeys: ['businessApps', 'edgeDeploy', 'a11yPerf'],
  },
  {
    key: 'automation',
    itemKeys: ['apiSync', 'pipelines', 'zeroManual'],
  },
  {
    key: 'engines',
    itemKeys: ['vectorPdf', 'geoRouting', 'diagrams'],
  },
] as const

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

      <div>
        {DOMAIN_CATEGORIES.map((cat) => (
          <div className="dev-domain-cat" key={cat.key}>
            <div className="dev-domain-label">
              <div className="dev-domain-num-row">
                <span className="label dev-domain-num" aria-hidden="true">
                  {t(`categories.${cat.key}.num`)}
                </span>
                <h3 className="dev-domain-name">{t(`categories.${cat.key}.name`)}</h3>
              </div>
              <p className="dev-domain-desc">{t(`categories.${cat.key}.desc`)}</p>
            </div>

            <ul
              className="dev-domain-items"
              aria-label={`Services ${t(`categories.${cat.key}.name`)}`}
            >
              {cat.itemKeys.map((itemKey) => (
                <li className="dev-domain-item" key={itemKey}>
                  <h4 className="dev-domain-item-name">
                    {t(`categories.${cat.key}.items.${itemKey}.name`)}
                  </h4>
                  <p className="dev-domain-item-detail">
                    {t(`categories.${cat.key}.items.${itemKey}.detail`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
