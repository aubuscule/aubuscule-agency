import { useTranslations } from 'next-intl'
import { DevContactForm } from './DevContactForm'

export function DevContact() {
  const t = useTranslations('dev.contact')

  const mailtoUrl = `mailto:contact@aubuscule.com?subject=${encodeURIComponent(
    'Demande de projet logiciel / automatisation'
  )}`

  return (
    <section className="dev-section dev-section-pb" id="contact" aria-labelledby="dev-contact-heading">
      <div className="dev-contact-grid">
        <div className="dev-contact-col">
          <div>
            <p className="eyebrow dev-contact-eyebrow">{t('eyebrow')}</p>
            <h2 className="dev-contact-h2" id="dev-contact-heading">
              {t('h2')}
            </h2>
            <p className="dev-contact-lead">{t('lead')}</p>
          </div>

          <address className="dev-contact-details">
            <a href={mailtoUrl} className="dev-contact-item">
              <span className="label-sm dev-contact-item-label">{t('emailLabel')}</span>
              <span className="dev-contact-item-value">contact@aubuscule.com</span>
            </a>
            <a
              href="https://github.com/aubuscule"
              className="dev-contact-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="label-sm dev-contact-item-label">{t('githubLabel')}</span>
              <span className="dev-contact-item-value dev-contact-item-iconlink">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                github.com/aubuscule
              </span>
            </a>
          </address>
        </div>

        <DevContactForm />
      </div>
    </section>
  )
}
