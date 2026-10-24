import { useTranslations } from 'next-intl'
import { BOOKING_URL } from '@/lib/site'
import { ContactForm } from './ContactForm'

export function Contact() {
  const t = useTranslations('contact')

  const mailtoUrl = `mailto:contact@aubuscule.com?subject=${encodeURIComponent(
    t('mailtoSubject')
  )}&body=${encodeURIComponent(t('mailtoBody'))}`

  return (
    <section className="section section-pb" id="contact" aria-labelledby="contact-heading">
      <div className="contact-grid">
        <div className="contact-col">
          <div>
            <p className="eyebrow contact-eyebrow">{t('eyebrow')}</p>
            <h2 className="contact-h2" id="contact-heading">{t('h2')}</h2>
            <p className="contact-lead">{t('lead')}</p>
          </div>
          <address className="contact-details">
            <a href={mailtoUrl} className="contact-item">
              <span className="label-sm contact-item-label">{t('emailLabel')}</span>
              <span className="contact-item-value">contact@aubuscule.com</span>
            </a>
            <a href={BOOKING_URL} className="contact-item" target="_blank" rel="noopener noreferrer">
              <span className="label-sm contact-item-label">{t('callLabel')}</span>
              <span className="contact-item-value">{t('callValue')}</span>
            </a>
            <a href="https://www.instagram.com/aubuscule_agency/" className="contact-item" target="_blank" rel="noopener noreferrer">
              <span className="label-sm contact-item-label">{t('instagramLabel')}</span>
              <span className="contact-item-value contact-item-instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                @aubuscule_agency
              </span>
            </a>
          </address>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}

